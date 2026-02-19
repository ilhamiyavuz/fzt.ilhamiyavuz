module.exports = async function handler(req, res) {
    // CORS Preflight (Ön Uçuş) isteklerini güvenli şekilde kabul etme
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Sadece POST HTTP metoduna izin veriyoruz (RESTful standardı)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = req.body;
    
    // Vercel Environment Variables içinden API Anahtarını gizlice çekiyoruz.
    const apiKey = process.env.GEMINI_API_KEY;

    // API key validasyon kontrolü (Node.js Environment)
    if (!apiKey) {
        console.error("CRITICAL ERROR: GEMINI_API_KEY ortam değişkeni bulunamadı.");
        return res.status(500).json({ reply: 'Sunucu tarafında API anahtarı yapılandırma hatası.' });
    }

    const systemInstruction = `Sen Fizyoterapist İlhami Yavuz'un dijital asistanı FizyoAsistan'sın.
Bağlam: Erzurum "Paylaşım Özel Eğitim ve Rehabilitasyon Merkezi"nde hizmet veriyorsunuz.
Profil: Fzt. İlhami Yavuz 25 yaşında, genç, dinamik ve biyomekanik problemleri kaynak odaklı çözen bir uzmandır.
Görev: Gelen soruya doğrudan, net ve profesyonelce yanıt ver. Kendini tekrar tanıtma.
Kısıtlama: Kesinlikle tıbbi teşhis koyma. "Kesin tanı için İlhami Hocamızın değerlendirmesi gerekir" de.
İletişim: Randevu veya adres sorulursa 05372751789 numarasını ver.`;

    const payload = {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nKullanıcı: ${message}\nFizyoAsistan:` }] }]
    };

    try {
        // Native Node.js Fetch API ile Gemini'ye tünel açıyoruz
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // Downstream API hata ayıklaması
        if (!response.ok) {
            console.error('Downstream API Hatası:', JSON.stringify(data));
            return res.status(502).json({ reply: 'Yapay zeka servisi şu an geçici olarak yanıt veremiyor.' });
        }

        // İstek başarılı, payload'ı parse edip client'a (frontend'e) döndürüyoruz
        const replyText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Lambda Function Exception:', error);
        return res.status(500).json({ 
            reply: "Sistemde geçici bir yoğunluk var. Lütfen 0537 275 17 89 numarasından İlhami Hocamıza doğrudan ulaşın." 
        });
    }
};