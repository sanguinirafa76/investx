/* ============================================================
   InvestX — market.js
   Dados de mercado em tempo real, ticker, sidebar mini
   ============================================================ */

// ============================================================
// CONSTANTES GLOBAIS
// ============================================================

const LOGO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAD7UlEQVR4AdSWV6gVVxSGJ4UUUiAJCSmQnkAaJHlJh7Q3RR+sWLFg7ygqghUUG/aOCHYsWFDwxYodLNjwwd4VFAUVG+r3zZ193Gc8997jk3j4/7XWXmvPrDl7r12eT57S75lJ7If+xiA1gj0zav+KbQxVHsrt/C2vmwYvwa1wHhyZUXsbtrHJaPuiqkZ1id/n8RXwIGwD34GVwVh7gvZdgn4PVoqqEn/BU/6TWmhxH7ES9oc14QcZtQdgG3uAFnUQ2+FnsCQqS/wJvU36KVocR/wOa8MhcDW8kFF7MLaxP9CnoDCpyT+2kWepxC/TaRV8F4rpiO/hDhjgBw2kIbUxU/ix32HNgMLhXobhO1GPUCrxaMImQiUTEW3hTRjjTxoOr4wT406uI6yHKWjxM2IYLEI+8ZdE20FxFNELxmhK4xicAwPmYvSBz8EYPnsyc3RBfw0LyCd2bb5A1EJqgL4FA2zPpuHcoQr4CMt/NAEd4waNxtCC852dsQuIE/vF9bKIa3VXZgflR2nfQfiP/fctsfdA0RHxFoyxhUaoDSvdHLiSJE78F563obAa1TF/yBrj0c2gQzwLXR8OyvgqOg8LTp/Lzx1Ouyjxj6mnQpRKfL4ilJjUoa1L+2/4BrS65TnsPEJi/T8pZPyPX9eRcWOmY2WF23aJWEyLaayHu6HDbQFhPoY48ZshGid27oL/xWBEegy2CQ+h83C0xuFsAfO4FznuBjtO7CYf/L4o2EFb6cNpuEH8gv4HWowj0Neg6KrIsTC8+N3tUMXFtT/1VIhSifsSch5roHfCDdDDoDd6ORSfK3KMExdyxP/YebqSPVQqcTgMFtLH3c3iaoLt0mqOFocVOYbEV/HvgynixDrWKqAbftFOg687dDu0CHtgW1wmNTnNxLkMa922/ArhB6OSNYrAfOJJWeAV9FL4EgxweF3rVnLwBe3p9T+NTTDAZz0gfJe+sYrAfGKXkQe/cQ8Ki0k7cC/Gv9BhRqVwB3NufTZ1ZMLpsBBtLkKEHQyzuLhSB6IVDGdqN2yPuNfQMdxOw261OQ5gu6HMRHeCwsOmg0bM/D82dhnxH7wIRWuEa9ddCjPFCaQVLrVppnCJHcByD0clvsMp8J22CyyV2OARhOdo2Dq9RTi33qe80DUk/iH0LPaWORXbj1uHti8q8YCwouMP05+yssQG3XctJu9Yt3VAb5Be6BZgn4UWlbdMLwvf0Bb27YfhCIX9nWYxqkpsT5eIdyyXhTeKx4bMThmN2cfLxFB8PosqjeoSh6dOY1ggHhBe6D3gvWFIbX3G7HOGvtWi3MThRe7Xzvt8HKMyauszhqs8PGni8t5aRq+HAAAA//++iSM6AAAABklEQVQDAPdMuT25PGg0AAAAAElFTkSuQmCC";

// ============================================================
// DADOS DE MERCADO EM TEMPO REAL (via APIs públicas gratuitas)
// ============================================================

const marketCache = {};

async function fetchRealPrice(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fail');
    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) throw new Error('no result');
    const price = result.meta?.regularMarketPrice;
    const prevClose = result.meta?.previousClose || result.meta?.chartPreviousClose;
    const chg = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
    return { price, chg, up: chg >= 0 };
  } catch {
    return null;
  }
}

const YF_MAP = {
  'PETR4': 'PETR4.SA', 'VALE3': 'VALE3.SA', 'ITUB4': 'ITUB4.SA',
  'BBDC4': 'BBDC4.SA', 'MGLU3': 'MGLU3.SA', 'WEGE3': 'WEGE3.SA',
  'MXRF11': 'MXRF11.SA', 'HGLG11': 'HGLG11.SA', 'XPLG11': 'XPLG11.SA', 'VISC11': 'VISC11.SA',
  'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SOL': 'SOL-USD', 'XRP': 'XRP-USD',
  'IBOV': '^BVSP', 'NASDAQ': '^IXIC',
};

function formatPrice(symbol, price) {
  if (!price) return '—';
  if (['BTC', 'ETH', 'SOL'].includes(symbol)) {
    return 'R$ ' + (price * 6.0).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  }
  if (['XRP'].includes(symbol)) {
    return 'R$ ' + (price * 6.0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (symbol.endsWith('11')) return 'R$ ' + price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (['IBOV'].includes(symbol)) return price.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  if (['NASDAQ'].includes(symbol)) return price.toLocaleString('pt-US', { maximumFractionDigits: 0 });
  return 'R$ ' + price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Dados de fallback
const MKT_FALLBACK = {
  acoes: [
    {tick:'PETR4', name:'Petrobras PN',   price:'R$37,48', chg:'+2.30%', vol:'R$1,2bi', score:82, up:true, color:'linear-gradient(135deg,#8b0000,#dc2626)', lbl:'P4'},
    {tick:'VALE3', name:'Vale ON',         price:'R$62,14', chg:'-0.80%', vol:'R$980mi', score:55, up:false,color:'linear-gradient(135deg,#1a1a2e,#3b3b6b)', lbl:'V3'},
    {tick:'ITUB4', name:'Itaú Unibanco',  price:'R$32,15', chg:'+1.10%', vol:'R$1,5bi', score:78, up:true, color:'linear-gradient(135deg,#1e3a1e,#166534)', lbl:'IT'},
    {tick:'BBDC4', name:'Bradesco PN',     price:'R$15,40', chg:'+0.50%', vol:'R$620mi', score:63, up:true, color:'linear-gradient(135deg,#1e293b,#334155)', lbl:'BB'},
    {tick:'MGLU3', name:'Magazine Luiza',  price:'R$5,12',  chg:'-3.20%', vol:'R$340mi', score:28, up:false,color:'linear-gradient(135deg,#1a1a2e,#2563eb)', lbl:'MG'},
    {tick:'WEGE3', name:'WEG ON',          price:'R$48,70', chg:'+0.90%', vol:'R$290mi', score:88, up:true, color:'linear-gradient(135deg,#1c1c1e,#374151)', lbl:'WE'},
  ],
  fiis: [
    {tick:'MXRF11', name:'Maxi Renda FII', price:'R$10,12',  chg:'+0.40%', vol:'R$45mi', score:71, up:true, color:'linear-gradient(135deg,#78350f,#b45309)', lbl:'MX'},
    {tick:'HGLG11', name:'CSHG Logística', price:'R$168,50', chg:'-0.20%', vol:'R$28mi', score:68, up:false,color:'linear-gradient(135deg,#1e3a1e,#166534)', lbl:'HG'},
    {tick:'XPLG11', name:'XP Log FII',     price:'R$108,20', chg:'+0.70%', vol:'R$22mi', score:75, up:true, color:'linear-gradient(135deg,#1a1a2e,#2563eb)', lbl:'XP'},
    {tick:'VISC11', name:'Vinci Shopping', price:'R$112,80', chg:'+0.30%', vol:'R$18mi', score:65, up:true, color:'linear-gradient(135deg,#1e293b,#334155)', lbl:'VI'},
  ],
  cripto: [
    {tick:'BTC', name:'Bitcoin',  price:'R$430.800', chg:'+4.70%', vol:'R$2,1bi', score:91, up:true, color:'linear-gradient(135deg,#78350f,#b45309)', lbl:'₿'},
    {tick:'ETH', name:'Ethereum', price:'R$22.100',  chg:'+2.90%', vol:'R$1,4bi', score:84, up:true, color:'linear-gradient(135deg,#1e1e50,#3b82f6)', lbl:'Ξ'},
    {tick:'SOL', name:'Solana',   price:'R$780',     chg:'+6.10%', vol:'R$380mi', score:77, up:true, color:'linear-gradient(135deg,#1a1a2e,#6d28d9)', lbl:'S'},
    {tick:'XRP', name:'Ripple',   price:'R$3,12',    chg:'-1.40%', vol:'R$290mi', score:48, up:false,color:'linear-gradient(135deg,#1e293b,#334155)', lbl:'X'},
  ],
  indices: [
    {tick:'IBOV',   name:'Ibovespa', price:'128.741', chg:'+0.87%', vol:'R$18,4bi', score:72, up:true, color:'linear-gradient(135deg,#8b0000,#dc2626)', lbl:'IB'},
    {tick:'S&P500', name:'S&P 500',  price:'5.248',   chg:'+0.32%', vol:'USD 420bi',score:68, up:true, color:'linear-gradient(135deg,#1e3a1e,#166534)', lbl:'SP'},
    {tick:'NASDAQ', name:'Nasdaq',   price:'18.421',  chg:'+0.55%', vol:'USD 210bi',score:70, up:true, color:'linear-gradient(135deg,#1a1a2e,#2563eb)', lbl:'NQ'},
    {tick:'SELIC',  name:'Taxa Selic',price:'10,75%', chg:'0,00%',  vol:'—',        score:50, up:true, color:'linear-gradient(135deg,#374151,#6b7280)', lbl:'SL'},
  ],
};

let currentMarketData = JSON.parse(JSON.stringify(MKT_FALLBACK));
let currentMarketKey = 'acoes';

async function refreshRealPrices() {
  const allTickers = [
    ...MKT_FALLBACK.acoes.map(r => r.tick),
    ...MKT_FALLBACK.fiis.map(r => r.tick),
    ...MKT_FALLBACK.cripto.map(r => r.tick),
    ...['IBOV', 'NASDAQ'],
  ];

  for (const tick of allTickers) {
    const yfSym = YF_MAP[tick];
    if (!yfSym) continue;
    try {
      const data = await fetchRealPrice(yfSym);
      if (!data || !data.price) continue;

      for (const cat of ['acoes','fiis','cripto','indices']) {
        const row = currentMarketData[cat].find(r => r.tick === tick);
        if (row) {
          row.price = formatPrice(tick, data.price);
          const sign = data.up ? '+' : '';
          row.chg = sign + data.chg.toFixed(2) + '%';
          row.up = data.up;
          marketCache[tick] = data;
        }
      }

      if (document.getElementById('marketBody')) {
        renderMarketTable(currentMarketKey);
      }

      updateLandingTicker();
      updateSidebarMini();
    } catch {}
  }
}

// ============================================================
// TICKER — LANDING PAGE
// ============================================================

function buildTickerContent() {
  const tickers = [
    ...currentMarketData.acoes,
    ...currentMarketData.cripto.slice(0, 2),
    { tick: 'IBOV', ...currentMarketData.indices[0] },
  ];

  return tickers.map(r => {
    const cls = r.up ? 't-up' : 't-dn';
    const arr = r.up ? '▲' : '▼';
    const sign = r.up ? '+' : '';
    return `<span class="${cls}">${r.tick} ${arr} ${sign}${r.chg}&nbsp;&nbsp;&nbsp;</span>`;
  }).join('');
}

function updateLandingTicker() {
  const track = document.getElementById('tickerTrack');
  if (!track) return;
  const content = buildTickerContent();
  track.innerHTML = content + content;
}

function initLandingTicker() {
  updateLandingTicker();
}

// ============================================================
// SIDEBAR MINI — preços em tempo real
// ============================================================

function updateSidebarMini() {
  const miniItems = document.querySelectorAll('.mini-asset');
  if (!miniItems.length) return;

  const updates = [
    { name: 'IBOV', data: marketCache['IBOV'] },
    { name: 'S&P500', data: null },
    { name: 'BTC/USD', data: marketCache['BTC'] },
    { name: 'USD/BRL', data: null },
  ];

  const sideFallback = [
    { name:'IBOV',   val:'128.741',  up:true  },
    { name:'S&P500', val:'5.248',    up:true  },
    { name:'BTC/USD',val:'84.210',   up:true  },
    { name:'USD/BRL',val:'5,87',     up:false },
  ];

  miniItems.forEach((el, i) => {
    const fb = sideFallback[i];
    const cached = updates[i]?.data;
    const valEl = el.querySelector('.mini-val');
    if (!valEl) return;

    if (cached) {
      const arr = cached.up ? '▲' : '▼';
      const sign = cached.up ? '+' : '';
      valEl.textContent = `${arr} ${formatPrice(fb.name.split('/')[0], cached.price)}`;
      valEl.className = 'mini-val ' + (cached.up ? 'up' : 'dn');
    } else {
      const arr = fb.up ? '▲' : '▼';
      valEl.textContent = `${arr} ${fb.val}`;
      valEl.className = 'mini-val ' + (fb.up ? 'up' : 'dn');
    }
  });
}

// ============================================================
// TABELA DE MERCADO
// ============================================================

function switchMarketTab(btn, key) {
  currentMarketKey = key;
  document.querySelectorAll('.mtab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMarketTable(key);
}

function renderMarketTable(key) {
  currentMarketKey = key;
  const tbody = document.getElementById('marketBody');
  if (!tbody) return;
  tbody.innerHTML = '';
  (currentMarketData[key] || []).forEach((row, i) => {
    const sc = row.score >= 70 ? 'var(--red-bright)' : row.score >= 50 ? '#f59e0b' : '#6b7280';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="color:var(--gray);font-size:12px">${i+1}</td>
      <td><span class="asset-cell">
        <span class="asset-logo-sm" style="background:${row.color};color:white">${row.lbl}</span>
        <span>
          <strong style="color:var(--white);font-family:'Share Tech Mono',monospace;font-size:12px">${row.tick}</strong>
          <br><span style="font-size:11px;color:var(--gray)">${row.name}</span>
        </span>
      </span></td>
      <td class="td-r">${row.price}</td>
      <td class="td-r ${row.up?'up':'dn'}">${row.up?'▲':'▼'} ${row.chg}</td>
      <td class="td-r" style="color:var(--gray)">${row.vol}</td>
      <td class="td-r">
        <span style="color:${sc}">${row.score}</span>
        <span class="heat-bar"><span class="heat-fill" style="width:${row.score}%;background:${sc}"></span></span>
      </td>`;
    tbody.appendChild(tr);
  });
}
