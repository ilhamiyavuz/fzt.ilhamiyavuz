// api/chat.js
// Vercel Serverless Function - Gemini API Proxy

export default async function handler(req, res) {
  // CORS ayarları
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS request için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Sadece POST isteklerine izin ver
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Environment variable'dan API key'i al
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API configuration error' });
    }

    // Sistem promptu
    const systemPrompt = `Sen Fzt. İlhami Yavuz'un asistanı FizyoAsistan'sın. 

Görevin: Kullanıcının şikayetlerini teknik ve tıbbi bir dille analiz edip, fizyoterapi perspektifinden (Pediatrik, Nörolojik, Ortopedik) profesyonel rehberlik sağlamaktır. 

Kurallar: 
1. Yanıtlarını verirken teknik bir dil kullan ama hastanın anlayabileceği şekilde açıkla.
2. Şikayete odaklan, kişisel hayat hikayesi anlatma.
3. Tıbbi teşhis koyma, klinik değerlendirme için fizyoterapiste yönlendir.
4. Randevu taleplerinde 0537 275 17 89 numarasını ve Ardahan İlk Paylaşım Özel Eğitim Merkezi'ni belirt.
5. Yanıtların kısa ve öz olsun (maksimum 3-4 cümle).
6. Nazik ve profesyonel ol.`;

    // Gemini API'ye istek gönder
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: message }]
            }
          ],
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(response.status).json({ 
        error: 'AI service error',
        details: errorData 
      });
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                     'Şikayetlerinize yönelik detaylı analiz için randevu alabilirsiniz. 0537 275 17 89';

    return res.status(200).json({ reply: botReply });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}