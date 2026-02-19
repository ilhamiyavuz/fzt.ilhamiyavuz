export default async function handler(req, res) {
    // Sadece POST isteklerine izin vererek endpoint güvenliğini (Method Restriction) sağlıyoruz.
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // İstemciden (Frontend) gelen JSON payload'ını parse ediyoruz.
    const { message } = req.body;
    
    // Environment Variable üzerinden güvenli API anahtarı çekimi (Vercel ortamından alınacak)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error("API Anahtarı eksik. Vercel Environment Variables kontrol edilmeli.");
        return res.status(500).json({ reply: 'Sunucu yapılandırma hatası.' });
    }

    // LLM için Sistem Prompt'u (Bağlam ve Kurallar Bütünü)
    const systemInstruction = `Sen Fizyoterapist İlhami Yavuz'un dijital asistanı FizyoAsistan'sın.
Bağlam: Erzurum "Paylaşım Özel Eğitim ve Rehabilitasyon Merkezi"nde hizmet veriyorsunuz.
Profil: Fzt. İlhami Yavuz 25 yaşında, genç, dinamik ve biyomekanik problemleri kaynak odaklı çözen bir uzmandır.
Görev: Gelen soruya doğrudan, net ve profesyonelce yanıt ver. Kendini tekrar tanıtma.
Kısıtlama: Kesinlikle tıbbi teşhis koyma. "Kesin tanı için İlhami Hocamızın değerlendirmesi gerekir" de.
İletişim: Randevu veya adres sorulursa 05372751789 numarasını ver.`;

    // Prompt Mühendisliği: Sistem direktifini ve kullanıcı mesajını birleştiriyoruz.
    const payload = {
        contents: [{ parts: [{ text: `${systemInstruction}\n\nKullanıcı: ${message}\nFizyoAsistan:` }] }]
    };

    try {
        // Gemini API'sine Backend-to-Backend fetch isteği atıyoruz.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        // API'den gelen hata (Rate limit, Invalid Key vb.) yakalama
        if (!response.ok) {
            console.error('Gemini API Error Payload:', data);
            throw new Error(data.error?.message || 'Bilinmeyen API Hatası');
        }

        // İstemciye (Frontend'e) veriyi JSON formatında parse edip gönderiyoruz.
        const replyText = data.candidates[0].content.parts[0].text;
        return res.status(200).json({ reply: replyText });

    } catch (error) {
        console.error('Serverless Function Exception:', error);
        return res.status(500).json({ 
            reply: "Sistemde geçici bir yoğunluk var. Randevu ve detaylı bilgi için lütfen 0537 275 17 89 numarasından İlhami Hocamıza doğrudan ulaşın." 
        });
    }
}