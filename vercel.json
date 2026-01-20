export default async function handler(req, res) {
  // Sadece POST isteklerine izin veriyoruz
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  // API anahtarını Vercel Environment Variables üzerinden çekeceğiz
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ reply: "API anahtarı yapılandırılmamış." });
  }

  const systemPrompt = `Sen Fzt. İlhami Yavuz'un asistanı FizyoAsistan'sın. 
  Görevin: Hastaları nazikçe karşılamak, şikayetlerini dinlemek ve profesyonel rehberlik sunmaktır.
  Kurallar:
  1. Selam verene aynı sıcaklıkla selam ver ve şikayetini sor.
  2. Şikayetlerde önce geçmiş olsun de, sonra kısa bir analiz sorusu sor (Örn: Ağrı kola vuruyor mu?).
  3. Yıldız (*) işareti asla kullanma.
  4. Teknik terimleri parantez içinde açıkla (Örn: Herni (Fıtık)).
  5. Cevapların kısa, net olsun. Randevu numarası: 0537 275 17 89.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      })
    });

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.status(200).json({ reply: botReply });
  } catch (error) {
    res.status(500).json({ reply: "Sistemde teknik bir aksaklık oluştu, lütfen 0537 275 17 89'u arayın." });
  }
}