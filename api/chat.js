/* ============================================================
   InvestX — api/chat.js
   Vercel Serverless Function — proxy seguro para a Anthropic API
   A chave fica em variável de ambiente no painel da Vercel,
   nunca exposta ao cliente.
   ============================================================ */

export default async function handler(req, res) {
  // Só aceita POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // Lê a chave do ambiente (configurada no painel da Vercel)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY não configurada no servidor.' });
  }

  // Extrai o body enviado pelo frontend
  const { messages, system, max_tokens = 1024, temperature = 0.7 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Campo "messages" ausente ou inválido.' });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            apiKey,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:       'claude-haiku-4-5-20251001', // modelo rápido e econômico
        max_tokens,
        temperature,
        system,
        messages,
      }),
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      // Repassa o erro da Anthropic sem expor a chave
      return res.status(anthropicRes.status).json({
        error: data?.error?.message || 'Erro na Anthropic API',
      });
    }

    // Retorna apenas o conteúdo da resposta ao cliente
    const text = data?.content?.[0]?.text ?? '';
    return res.status(200).json({ reply: text });

  } catch (err) {
    console.error('[api/chat] Erro:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}