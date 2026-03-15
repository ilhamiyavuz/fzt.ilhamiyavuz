const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const ipRequestLog = new Map();

function normalizeAllowedOrigins(value) {
    if (!value) return [];

    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((origin) => origin.replace(/\/$/, ''));
}

function getClientIp(req) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
        return forwardedFor.split(',')[0].trim();
    }
    return req.socket?.remoteAddress || 'unknown';
}

function getRequestOrigin(req) {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && origin.trim()) {
        return origin.trim().replace(/\/$/, '');
    }

    const referer = req.headers.referer;
    if (typeof referer === 'string' && referer.trim()) {
        try {
            return new URL(referer).origin.replace(/\/$/, '');
        } catch {
            return '';
        }
    }

    return '';
}

function getRequestHost(req) {
    const forwardedHost = req.headers['x-forwarded-host'];
    if (typeof forwardedHost === 'string' && forwardedHost.trim()) {
        return forwardedHost.split(',')[0].trim().toLowerCase();
    }

    const host = req.headers.host;
    if (typeof host === 'string' && host.trim()) {
        return host.trim().toLowerCase();
    }

    return '';
}

function isRateLimited(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;
    const history = (ipRequestLog.get(ip) || []).filter((t) => t > windowStart);

    history.push(now);
    ipRequestLog.set(ip, history);

    return history.length > RATE_LIMIT_MAX_REQUESTS;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!req.headers['content-type']?.includes('application/json')) {
        return res.status(415).json({ error: 'Content-Type application/json olmalı.' });
    }

    const allowedOrigins = normalizeAllowedOrigins(process.env.ALLOWED_ORIGINS);
    if (allowedOrigins.length > 0) {
        const requestOrigin = getRequestOrigin(req);
        const requestHost = getRequestHost(req);

        const isAllowedOrigin = allowedOrigins.includes(requestOrigin);
        const isAllowedHost = allowedOrigins.some((origin) => {
            try {
                return new URL(origin).host.toLowerCase() === requestHost;
            } catch {
                return false;
            }
        });

        if (!isAllowedOrigin && !isAllowedHost) {
            return res.status(403).json({ error: 'Bu endpoint sadece izinli domainden kullanılabilir.' });
        }
    }

    const clientIp = getClientIp(req);
    if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.' });
    }

    const { message } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Geçerli bir mesaj gerekli.' });
    }

    if (message.length > 1000) {
        return res.status(400).json({ error: 'Mesaj çok uzun. Lütfen 1000 karakter altında tutun.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Sunucu yapılandırma hatası.' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: `Sen Fizyoterapist İlhami Yavuz'un dijital asistanı FizyoAsistan'sın. Erzurum "Paylaşım Özel Eğitim ve Rehabilitasyon Merkezi"nde hizmet veriyorsunuz. Randevu için 05372751789 numarasını ver. Kesinlikle tıbbi teşhis koyma.` }]
                    },
                    contents: [{ role: 'user', parts: [{ text: message.trim() }] }]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            const upstreamError = data?.error?.message || 'Yapay zeka servisine erişilemedi.';
            return res.status(response.status).json({ error: upstreamError });
        }

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply: reply || 'Anlayamadım, lütfen tekrar deneyin.' });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Beklenmeyen bir sunucu hatası oluştu.' });
    }
}
