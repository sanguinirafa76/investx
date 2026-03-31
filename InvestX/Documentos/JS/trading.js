/* ============================================================
   InvestX — trading.js
   Negociar: compra, venda, simulação, histórico de ordens
   ============================================================ */

const TRADE_ASSETS = {
  'PETR4': { price: 37.48, chg: '+2,30%', score: 82, signal: 'COMPRAR', analysis: 'PETR4 em momento técnico positivo. Operando acima da MM20 com RSI neutro em 58. Suporte forte em R$35,80. Volume acima da média indica interesse comprador.', previsao: 'R$ 39,20 (+4,59%)', ret: 0.12 },
  'VALE3': { price: 62.14, chg: '▼ -0,80%', score: 55, signal: 'ATENÇÃO', analysis: 'VALE3 em tendência de baixa de curto prazo. Correlação com minério negativa. Risco do suporte em R$60 não ser mantido.', previsao: 'R$ 60,50 (-2,64%)', ret: 0.08 },
  'ITUB4': { price: 32.15, chg: '▲ +1,10%', score: 78, signal: 'MANTER', analysis: 'ITUB4 com fundamentos sólidos. ROE acima de 20% e dividend yield atrativo. Boa opção para carteira de dividendos.', previsao: 'R$ 33,80 (+5,13%)', ret: 0.15 },
  'BBDC4': { price: 15.40, chg: '▲ +0,50%', score: 63, signal: 'NEUTRO', analysis: 'BBDC4 em consolidação. Resultados estáveis porém crescimento abaixo dos pares. Acompanhe próximos balanços.', previsao: 'R$ 15,90 (+3,25%)', ret: 0.09 },
  'WEGE3': { price: 48.70, chg: '▲ +0,90%', score: 88, signal: 'COMPRAR', analysis: 'WEG é uma das melhores empresas da B3 em qualidade. Crescimento consistente de receita e margens elevadas. Ótimo para carteira de longo prazo.', previsao: 'R$ 51,50 (+5,75%)', ret: 0.18 },
  'MGLU3': { price: 5.12, chg: '▼ -3,20%', score: 28, signal: 'VENDER', analysis: 'MGLU3 em tendência de queda. Alta alavancagem e ambiente de juros altos pressiona o negócio. Evite adicionar posição.', previsao: 'R$ 4,80 (-6,25%)', ret: -0.05 },
  'BTC': { price: 430800, chg: '▲ +4,70%', score: 91, signal: 'COMPRAR', analysis: 'Bitcoin rompeu resistência de R$420k. Momentum altista forte. Próximo alvo: R$450k. Sentimento de mercado positivo.', previsao: 'R$ 455k (+5,81%)', ret: 0.85 },
  'ETH': { price: 22100, chg: '▲ +2,90%', score: 84, signal: 'COMPRAR', analysis: 'Ethereum com bom suporte em R$21k. Atividade on-chain crescente e narrativa de staking favorável.', previsao: 'R$ 23,5k (+6,33%)', ret: 0.60 },
  'SOL': { price: 780, chg: '▲ +6,10%', score: 77, signal: 'MANTER', analysis: 'Solana com alta volatilidade. Ecosistema crescendo mas risco maior que ETH. Aloque com cautela.', previsao: 'R$ 830 (+6,41%)', ret: 0.45 },
  'MXRF11': { price: 10.12, chg: '▲ +0,40%', score: 71, signal: 'COMPRAR', analysis: 'MXRF11 com dividend yield alto. FII de recebíveis com distribuição mensal consistente. Boa opção para renda passiva.', previsao: 'R$ 10,45 (+3,26%)', ret: 0.09 },
  'HGLG11': { price: 168.50, chg: '▼ -0,20%', score: 68, signal: 'NEUTRO', analysis: 'HGLG11 é FII de logística de qualidade. Portfólio diversificado, mas cotação esticada. Aguarde melhor ponto de entrada.', previsao: 'R$ 170 (+0,89%)', ret: 0.11 },
};

function switchTradeTab(btn, key) {
  document.querySelectorAll('.trade-panel').forEach(p => p.style.display = 'none');
  document.querySelectorAll('#view-negociar .mtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('trade-' + key);
  if (panel) panel.style.display = 'block';
  if (key === 'simular') runSimulation();
}

function updateTradePrice(prefix) {
  const sel = document.getElementById(prefix + '-asset');
  if (!sel) return;
  const [tick, price] = sel.value.split('|');
  const info = TRADE_ASSETS[tick] || {};
  const p = parseFloat(price) || info.price || 0;

  const unitEl = document.getElementById(prefix + '-unit-price');
  if (unitEl) unitEl.textContent = 'R$ ' + p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const infoPrice = document.getElementById('info-price');
  if (infoPrice) infoPrice.textContent = 'R$ ' + p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const infoChg = document.getElementById('info-chg');
  if (infoChg) { infoChg.textContent = info.chg || '—'; infoChg.className = (info.chg||'').includes('-') ? 'dn' : 'up'; }
  const infoScore = document.getElementById('info-score');
  if (infoScore) infoScore.textContent = (info.score || 0) + '/100';
  const infoSignal = document.getElementById('info-signal');
  if (infoSignal) infoSignal.textContent = info.signal || '—';
  const infoAnalysis = document.getElementById('info-analysis');
  if (infoAnalysis) infoAnalysis.textContent = info.analysis || '';

  calcTradeTotal(prefix);
}

function toggleLimitPrice(prefix) {
  const type = document.getElementById(prefix + '-order-type')?.value;
  const wrap = document.getElementById(prefix + '-limit-price-wrap');
  if (wrap) wrap.style.display = (type === 'limitada' || type === 'stop' || type === 'stop-gain') ? 'block' : 'none';
}

function calcTradeTotal(prefix) {
  const sel = document.getElementById(prefix + '-asset');
  const qty = parseFloat(document.getElementById(prefix + '-qty')?.value) || 0;
  if (!sel) return;
  const price = parseFloat(sel.value.split('|')[1]) || 0;
  const total = price * qty;
  const totalEl = document.getElementById(prefix + '-total');
  if (totalEl) totalEl.textContent = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcSellTotal() {
  const sel = document.getElementById('sell-asset');
  const qty = parseFloat(document.getElementById('sell-qty')?.value) || 0;
  if (!sel) return;
  const parts = sel.value.split('|');
  const currentPrice = parseFloat(parts[1]) || 0;
  const avgPrice = parseFloat(parts[3]) || 0;
  const total = currentPrice * qty;
  const result = (currentPrice - avgPrice) * qty;
  const pct = avgPrice ? ((currentPrice - avgPrice) / avgPrice * 100) : 0;

  const totalEl = document.getElementById('sell-total');
  if (totalEl) totalEl.textContent = 'R$ ' + total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const resultEl = document.getElementById('sell-result');
  if (resultEl) {
    const sign = result >= 0 ? '+' : '';
    resultEl.textContent = sign + 'R$ ' + result.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' (' + sign + pct.toFixed(2) + '%)';
    resultEl.className = result >= 0 ? 'up' : 'dn';
  }
}

function updateSellInfo() { calcSellTotal(); }

function executeOrder(tipo) {
  const assetSel = document.getElementById(tipo === 'compra' ? 'buy-asset' : 'sell-asset');
  const qtySel = document.getElementById(tipo === 'compra' ? 'buy-qty' : 'sell-qty');
  if (!assetSel || !qtySel) return;
  const tick = assetSel.value.split('|')[0];
  const price = parseFloat(assetSel.value.split('|')[1]) || 0;
  const qty = parseFloat(qtySel.value) || 0;
  const total = (price * qty).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const tbody = document.getElementById('ordens-body');
  if (tbody) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const tipoLabel = tipo === 'compra' ? 'COMPRA' : 'VENDA';
    const tipoBg = tipo === 'compra' ? 'rgba(220,38,38,.15)' : 'rgba(107,114,128,.15)';
    const tipoCor = tipo === 'compra' ? 'var(--red-bright)' : '#9ca3af';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--gray)">${dateStr}</td>
      <td><strong style="color:var(--white);font-family:'Share Tech Mono',monospace;font-size:12px">${tick}</strong></td>
      <td><span style="background:${tipoBg};color:${tipoCor};padding:2px 8px;border-radius:4px;font-size:11px;font-family:'Share Tech Mono',monospace">${tipoLabel}</span></td>
      <td class="td-r" style="font-family:'Share Tech Mono',monospace;font-size:12px">${qty}</td>
      <td class="td-r" style="font-family:'Share Tech Mono',monospace;font-size:12px">R$${price.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
      <td class="td-r" style="font-family:'Share Tech Mono',monospace;font-size:12px">R$${total}</td>
      <td class="td-r"><span style="background:rgba(34,197,94,.1);color:#4ade80;padding:2px 8px;border-radius:4px;font-size:11px;font-family:'Share Tech Mono',monospace">SIMULADA</span></td>`;
    tbody.prepend(tr);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:30px;right:30px;background:var(--card);border:1px solid var(--red-bright);border-radius:8px;padding:16px 24px;font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--white);z-index:9999;box-shadow:0 0 30px rgba(220,38,38,.3);animation:fadeIn .3s ease;`;
  const tipoLabel = tipo === 'compra' ? 'COMPRA' : 'VENDA';
  toast.innerHTML = `<p style="color:var(--red-bright);font-weight:bold;margin-bottom:4px">✅ Ordem simulada!</p><p>${tipoLabel} ${qty}x ${tick} · Total: R$${total}</p>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function runSimulation() {
  const sel = document.getElementById('sim-asset');
  const valorInput = document.getElementById('sim-valor');
  const periodoSel = document.getElementById('sim-periodo');
  const aporteSel = document.getElementById('sim-aporte');
  if (!sel || !valorInput || !periodoSel) return;

  const parts = sel.value.split('|');
  const tick = parts[0];
  const price = parseFloat(parts[1]) || 1;
  const annualRet = parseFloat(parts[2]) || 0.10;
  const valor = parseFloat(valorInput.value) || 0;
  const anos = parseInt(periodoSel.value) || 5;
  const aporte = parseFloat(aporteSel?.value) || 0;

  const cotas = Math.floor(valor / price);
  const meses = anos * 12;
  const taxaMensal = Math.pow(1 + annualRet, 1/12) - 1;

  let valorFinal = valor * Math.pow(1 + annualRet, anos);
  let totalInvestidoAportes = valor;
  let valorAportes = 0;
  for (let m = 1; m <= meses; m++) {
    valorAportes += aporte * Math.pow(1 + taxaMensal, meses - m);
    totalInvestidoAportes += aporte;
  }
  valorFinal += valorAportes;
  const lucro = valorFinal - totalInvestidoAportes;
  const rentPct = totalInvestidoAportes > 0 ? (lucro / totalInvestidoAportes * 100) : 0;

  const fmt = (v) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
  document.getElementById('sim-final-value').textContent = fmt(valorFinal);
  document.getElementById('sim-total-inv').textContent = fmt(totalInvestidoAportes);
  document.getElementById('sim-lucro').textContent = (lucro >= 0 ? '+' : '') + fmt(lucro);
  document.getElementById('sim-lucro').className = lucro >= 0 ? 'up' : 'dn';
  document.getElementById('sim-rent').textContent = (rentPct >= 0 ? '+' : '') + rentPct.toFixed(1) + '%';
  document.getElementById('sim-rent').className = rentPct >= 0 ? 'up' : 'dn';
  document.getElementById('sim-cotas').textContent = cotas;

  const comment = document.getElementById('sim-ai-comment');
  if (comment) {
    if (annualRet >= 0.5) {
      comment.textContent = `${tick} é um ativo de alta volatilidade com potencial de retorno elevado. A simulação considera retorno histórico médio de ${(annualRet*100).toFixed(0)}% a.a. Aportes mensais regulares via DCA reduzem o risco de entrada em pico.`;
    } else if (annualRet >= 0.15) {
      comment.textContent = `${tick} tem histórico de crescimento consistente. Com aportes mensais e reinvestimento, o efeito dos juros compostos se amplifica significativamente ao longo do tempo.`;
    } else {
      comment.textContent = `${tick} é uma opção de menor volatilidade. Ideal para carteira de dividendos. Considere reinvestir os proventos para potencializar o retorno no longo prazo.`;
    }
  }
}
