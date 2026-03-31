/* ============================================================
   InvestX — chat.js
   Chat OMEGA IA — chama o proxy Vercel (/api/chat)
   A chave de API fica no servidor; nunca exposta ao cliente.
   ============================================================ */

let chatHistory = [];

function getTime() {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
}

function appendMessage(text, isUser) {
  const c = document.getElementById('chatMessages');
  if (!c) return;
  const li = document.createElement('li');
  li.className = 'msg msg-' + (isUser ? 'user' : 'ai');
  if (!isUser) {
    const t = document.createElement('p');
    t.className = 'msg-tag'; t.textContent = 'OMEGA IA';
    li.appendChild(t);
  }
  const b = document.createElement('p');
  b.className = 'msg-bubble';
  b.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  li.appendChild(b);
  const tm = document.createElement('time');
  tm.className = 'msg-time'; tm.textContent = getTime();
  li.appendChild(tm);
  c.appendChild(li);
  c.scrollTop = c.scrollHeight;
}

function showTyping() {
  const c = document.getElementById('chatMessages');
  if (!c) return;
  const li = document.createElement('li');
  li.className = 'msg msg-ai'; li.id = 'typingWrapper';
  const t = document.createElement('span');
  t.className = 'typing show';
  t.innerHTML = '<span></span><span></span><span></span>';
  li.appendChild(t);
  c.appendChild(li);
  c.scrollTop = c.scrollHeight;
}

function hideTyping() {
  document.getElementById('typingWrapper')?.remove();
}

function buildMarketContext() {
  const acoes  = currentMarketData.acoes.slice(0, 3).map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');
  const cripto = currentMarketData.cripto.slice(0, 2).map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');
  const ibov   = currentMarketData.indices[0];
  return `\n\nDados de mercado em tempo real (${new Date().toLocaleString('pt-BR')}):\nAções: ${acoes}\nCriptos: ${cripto}\nIBOV: ${ibov?.price} (${ibov?.chg})`;
}

const SYSTEM_PROMPT = `Você é a OMEGA IA, assistente da plataforma InvestX — especializada em investimentos brasileiros e globais.

CAPACIDADES: Você responde QUALQUER tipo de pergunta com naturalidade — dúvidas gerais, curiosidades, ciência, tecnologia, história, cotidiano. Porém, seu diferencial e foco principal é o mercado financeiro.

ESPECIALIDADES FINANCEIRAS:
• Ações B3: análise técnica (MM, RSI, MACD, Bollinger, volume), fundamentalista (P/L, P/VP, ROE, EBITDA, Dividend Yield), valuation e comparativos setoriais
• FIIs: tipos (papel, tijolo, híbrido), DY mensal, P/VP, vacância, gestoras
• Criptomoedas: Bitcoin, Ethereum, altcoins, análise on-chain, sentimento
• Renda Fixa: Selic, CDI, IPCA+, Tesouro Direto, CDB, LCI/LCA, debêntures
• Estratégias: diversificação por perfil (conservador/moderado/arrojado), alocação de ativos, rebalanceamento, DCA
• Macro: Selic, inflação, câmbio, PIB, impacto nos ativos
• Internacional: S&P 500, Nasdaq, ETFs globais, BDRs

REGRAS DE COMPORTAMENTO:
• Responda sempre em português do Brasil, tom profissional mas acessível
• Use **negrito** para destacar ativos, valores, percentuais e termos-chave
• Para análises de ativos: NUNCA dê ordens diretas de compra/venda — apresente como análise, não recomendação vinculante
• Para perguntas gerais (não-financeiras): responda normalmente, de forma útil e direta
• Quando relevante, conecte temas gerais ao contexto de investimentos de forma natural
• Seja objetivo: 2-4 parágrafos no máximo, salvo quando o usuário pedir mais detalhes
• Use dados de mercado em tempo real quando disponíveis no contexto
• Ao mencionar indicadores, explique brevemente seu significado quando necessário`;

// ============================================================
// CHAMADA AO PROXY VERCEL — sem expor chave no cliente
// ============================================================

async function callOmegaIA(userMessage) {
  const marketCtx = buildMarketContext();

  // Monta histórico no formato Anthropic (user / assistant alternados)
  const messages = chatHistory.slice(-20).map(m => ({
    role:    m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system:      SYSTEM_PROMPT + marketCtx,
        messages,
        max_tokens:  1024,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return `❌ Erro do servidor: ${data.error || response.statusText}`;
    }

    return data.reply || '⚠️ Resposta vazia.';

  } catch (err) {
    return `❌ Erro de rede: ${err.message}`;
  }
}

// ============================================================
// ENVIO DE MENSAGEM
// ============================================================

async function sendMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, true);
  input.value = '';
  input.style.height = 'auto';

  chatHistory.push({ role: 'user', content: text });

  showTyping();
  const reply = await callOmegaIA(text);
  hideTyping();

  chatHistory.push({ role: 'assistant', content: reply });
  appendMessage(reply, false);
}

function sendChip(el) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  const raw     = el.textContent.trim();
  const cleaned = raw.replace(/^[\p{Emoji}\p{So}\p{Sm}]+\s*/u, '');
  input.value   = cleaned || raw;
  sendMessage();
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}