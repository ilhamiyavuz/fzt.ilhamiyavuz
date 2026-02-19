module.exports = async function handler(req, res) {
    // CORS (Cross-Origin) Başlıkları
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Hata 405: Sadece POST metoduna izin veriliyor.' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL: GEMINI_API_KEY ortam değişkeni bulunamadı.");
            return res.status(500).json({ reply: 'Sunucu Hatası: API Anahtarı tanımlanmamış.' });
        }

        const message = req.body?.message || "";

        const systemInstruction = `Sen Fizyoterapist İlhami Yavuz'un dijital asistanı FizyoAsistan'sın.
Bağlam: Erzurum "Paylaşım Özel Eğitim ve Rehabilitasyon Merkezi"nde hizmet veriyorsunuz.
Profil: Fzt. İlhami Yavuz 25 yaşında, genç, dinamik ve biyomekanik problemleri kaynak odaklı çözen bir uzmandır.
Görev: Gelen soruya doğrudan, net ve profesyonelce yanıt ver.
Kısıtlama: Kesinlikle tıbbi teşhis koyma. "Kesin tanı için İlhami Hocamızın değerlendirmesi gerekir" de.
İletişim: Randevu için 05372751789 numarasını ver.`;

        const payload = {
            contents: [{ parts: [{ text: `${systemInstruction}\n\nKullanıcı: ${message}\nFizyoAsistan:` }] }]
        };

        // DİNAMİK MODEL YÖNLENDİRMESİ (FALLBACK ALGORİTMASI)
        let modelId = 'gemini-1.5-flash-latest';
        let apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        // 1. İstek: Güncel modele (1.5-flash-latest) deneme yapıyoruz
        let response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            return res.status(502).json({ reply: `Gateway Hatası: Google sunucuları geçersiz yanıt döndürdü.` });
        }

        // 2. İstek (Fallback): Eğer 1.5 modeli 404 (Not Found) verirse, gemini-pro'ya geri çekil (Graceful Degradation)
        if (!response.ok && data.error?.code === 404) {
            console.warn(`Model ${modelId} bulunamadı. Stabil 'gemini-pro' modeline fallback yapılıyor...`);
            modelId = 'gemini-pro';
            apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
            
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            responseText = await response.text();
            data = JSON.parse(responseText);
        }

        // Son Hata Kontrolü
        if (!response.ok) {
            console.error('Gemini API Reddi:', data);
            return res.status(response.status).json({ reply: `Yapay Zeka Hatası: ${data.error?.message || 'Bilinmeyen Hata'}` });
        }

        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!replyText) {
             return res.status(500).json({ reply: 'Yapay zeka geçerli bir metin üretemedi.' });
        }

        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Lambda Execution Error:', error);
        return res.status(500).json({ reply: `İç Sunucu Hatası: ${error.message}` });
    }
};