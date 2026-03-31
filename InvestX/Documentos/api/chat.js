/* ============================================================
   InvestX — api/chat.js
   Vercel Serverless Function — proxy seguro para a Groq API
   A chave fica em variável de ambiente no painel da Vercel,
   nunca exposta ao cliente.
   ============================================================ */

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Lê a chave do ambiente (configurada no painel da Vercel)
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY não configurada no servidor.' });
  }

  // Extrai o body enviado pelo frontend
  const { messages, system, max_tokens = 1024, temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" ausente ou inválido.' });
  }

  try {
    // Groq usa o mesmo formato da OpenAI
    const groqMessages = [];

    // Adiciona system prompt como primeira mensagem
    if (system) {
      groqMessages.push({ role: 'system', content: system });
    }

    // Adiciona histórico de mensagens
    groqMessages.push(...messages);

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens,
        temperature,
        messages:    groqMessages,
      }),
    });

    const data = await groqRes.json();

    if (!groqRes.ok) {
      return res.status(groqRes.status).json({
        error: data?.error?.message || 'Erro na Groq API',
      });
    }

    const text = data?.choices?.[0]?.message?.content ?? '';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('[api/chat] Erro:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
