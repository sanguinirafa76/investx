/* ============================================================
   InvestX — api/chat.js
   Vercel Serverless Function — proxy seguro para Google Gemini API
   A chave fica em variável de ambiente no painel da Vercel,
   nunca exposta ao cliente.
   ============================================================ */

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Lê a chave do ambiente (configurada no painel da Vercel)
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  // Extrai o body enviado pelo frontend
  const { messages, system, max_tokens = 1024, temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" ausente ou inválido.' });
  }

  try {
    // Converte histórico do formato Anthropic para o formato Gemini
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents,
          generationConfig: {
            maxOutputTokens: max_tokens,
            temperature,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({
        error: data?.error?.message || 'Erro na Gemini API',
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('[api/chat] Erro:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
