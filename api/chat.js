module.exports = async function handler(req, res) {
    // CORS (Cross-Origin Resource Sharing) Güvenlik Politikaları
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Preflight isteklerini (OPTIONS) bypass etme
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ reply: 'Hata 405: Method Not Allowed' });
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("CRITICAL EXCEPTION: GEMINI_API_KEY ortam değişkeni eksik.");
            return res.status(500).json({ reply: 'Sunucu Hatası: Vercel üzerinde API Anahtarı bulunamadı. Lütfen Vercel panelinden ekleyin.' });
        }

        const message = req.body?.message || "";

        // Context Injection (Bağlam ve Persona Tanımlaması)
        const systemInstructionText = `Sen Fizyoterapist İlhami Yavuz'un dijital asistanı FizyoAsistan'sın.
Bağlam: Erzurum "Paylaşım Özel Eğitim ve Rehabilitasyon Merkezi"nde hizmet veriyorsunuz.
Profil: Fzt. İlhami Yavuz 25 yaşında, genç, dinamik ve biyomekanik problemleri kaynak odaklı çözen bir uzmandır.
Görev: Gelen soruya doğrudan, net ve profesyonelce yanıt ver. Kendini tekrar tanıtma.
Kısıtlama: Kesinlikle tıbbi teşhis koyma. "Kesin tanı için İlhami Hocamızın değerlendirmesi gerekir" de.
İletişim: Randevu için 05372751789 numarasını ver.`;

        // Native v1 API Schema
        const payload = {
            system_instruction: {
                parts: [{ text: systemInstructionText }]
            },
            contents: [
                {
                    role: "user",
                    parts: [{ text: message }]
                }
            ]
        };

        // DİKKAT: Endpoint v1beta'dan Kararlı v1 sürümüne güncellendi.
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        // Asenkron HTTP İsteği
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let data;
        
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("JSON Parse Exception:", responseText);
            return res.status(502).json({ reply: `Gateway Hatası: API geçerli bir JSON döndürmedi.` });
        }

        // Hata durumunda spesifik mesajı fırlat
        if (!response.ok) {
            console.error('Downstream API Error:', data);
            
            // Eğer yine 404 verirse, bunun kesinlikle API Key yetkisiyle alakalı olduğunu loglayacağız
            if (data.error?.code === 404) {
                return res.status(404).json({ reply: 'Sistem Hatası: Lütfen Google AI Studio üzerinden YENİ bir API Anahtarı alıp Vercel panelinize ekleyin.' });
            }
            
            return res.status(response.status).json({ reply: `API İletişim Hatası: ${data.error?.message || 'Bilinmeyen Hata'}` });
        }

        // Response Data Extraction (Yanıt verisinin ayrıştırılması)
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!replyText) {
             return res.status(500).json({ reply: 'Model geçerli bir text node üretemedi.' });
        }

        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Serverless Function Exception:', error);
        return res.status(500).json({ reply: `İç Sunucu Hatası (Exception): ${error.message}` });
    }
};