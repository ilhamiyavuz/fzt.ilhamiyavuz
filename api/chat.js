// api/chat.js - Vercel Serverless Function (CommonJS)

const MODEL = "gemini-2.0-flash-exp";
const SYSTEM_PROMPT = `Sen Fzt. İlhami Yavuz'un asistanı FizyoAsistan'sın. 

Görevin: Kullanıcının şikayetlerini teknik ve tıbbi bir dille analiz edip, fizyoterapi perspektifinden (Pediatrik, Nörolojik, Ortopedik) profesyonel rehberlik sağlamaktır. 

Kurallar: 
1. Yanıtlarını verirken teknik bir dil kullan ama hastanın anlayabileceği şekilde açıkla.
2. Şikayete odaklan, kişisel hayat hikayesi anlatma.
3. Tıbbi teşhis koyma, klinik değerlendirme için fizyoterapiste yönlendir.
4. Randevu taleplerinde 0537 275 17 89 numarasını ve Ardahan İlk Paylaşım Özel Eğitim Merkezi'ni belirt.
5. Yanıtların kısa ve öz olsun (maksimum 3-4 cümle).
6. Nazik ve profesyonel ol.`;

function getTextFromGemini(data) {
  const candidate = data?.candidates?.[0];
  const part = candidate?.content?.parts?.find(p => typeof p?.text === 'string');
  return part?.text || '';
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get API key from environment
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY environment variable is not set');
      return res.status(500).json({ 
        error: 'Server misconfigured: GEMINI_API_KEY missing' 
      });
    }

    // Parse body (Vercel sometimes gives string)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const message = body.message;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Missing "message" string in request body' });
    }

    // Gemini API URL
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

    // Request payload
    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      }
    };

    // Call Gemini API
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Handle API errors
    if (!response.ok) {
      console.error('❌ Gemini API error:', data);
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini API request failed',
        details: data
      });
    }

    // Extract response text
    const reply = getTextFromGemini(data) || 
                  'Şikayetlerinize yönelik detaylı analiz için randevu alabilirsiniz. 0537 275 17 89';

    console.log('✅ Chat response generated successfully');
    return res.status(200).json({ reply });

  } catch (error) {
    console.error('❌ Server error in /api/chat:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};