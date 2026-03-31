/* ============================================================
   InvestX — app.js
   ÚNICO arquivo JS para toda a aplicação
   ============================================================ */

// ============================================================
// CONSTANTES GLOBAIS
// ============================================================

const LOGO_B64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAD7UlEQVR4AdSWV6gVVxSGJ4UUUiAJCSmQnkAaJHlJh7Q3RR+sWLFg7ygqghUUG/aOCHYsWFDwxYodLNjwwd4VFAUVG+r3zZ193Gc8997jk3j4/7XWXmvPrDl7r12eT57S75lJ7If+xiA1gj0zav+KbQxVHsrt/C2vmwYvwa1wHhyZUXsbtrHJaPuiqkZ1id/n8RXwIGwD34GVwVh7gvZdgn4PVoqqEn/BU/6TWmhxH7ES9oc14QcZtQdgG3uAFnUQ2+FnsCQqS/wJvU36KVocR/wOa8MhcDW8kFF7MLaxP9CnoDCpyT+2kWepxC/TaRV8F4rpiO/hDhjgBw2kIbUxU/ix32HNgMLhXobhO1GPUCrxaMImQiUTEW3hTRjjTxoOr4wT406uI6yHKWjxM2IYLEI+8ZdE20FxFNELxmhK4xicAwPmYvSBz8EYPnsyc3RBfw0LyCd2bb5A1EJqgL4FA2zPpuHcoQr4CMt/NAEd4waNxtCC852dsQuIE/vF9bKIa3VXZgflR2nfQfiP/fctsfdA0RHxFoyxhUaoDSvdHLiSJE78F563obAa1TF/yBrj0c2gQzwLXR8OyvgqOg8LTp/Lzx1Ouyjxj6mnQpRKfL4ilJjUoa1L+2/4BrS65TnsPEJi/T8pZPyPX9eRcWOmY2WF23aJWEyLaayHu6HDbQFhPoY48ZshGid27oL/xWBEegy2CQ+h83C0xuFsAfO4FznuBjtO7CYf/L4o2EFb6cNpuEH8gv4HWowj0Neg6KrIsTC8+N3tUMXFtT/1VIhSifsSch5roHfCDdDDoDd6ORSfK3KMExdyxP/YebqSPVQqcTgMFtLH3c3iaoLt0mqOFocVOYbEV/HvgynixDrWKqAbftFOg687dDu0CHtgW1wmNTnNxLkMa922/ArhB6OSNYrAfOJJWeAV9FL4EgxweF3rVnLwBe3p9T+NTTDAZz0gfJe+sYrAfGKXkQe/cQ8Ki0k7cC/Gv9BhRqVwB3NufTZ1ZMLpsBBtLkKEHQyzuLhSB6IVDGdqN2yPuNfQMdxOw261OQ5gu6HMRHeCwsOmg0bM/D82dhnxH7wIRWuEa9ddCjPFCaQVLrVppnCJHcByD0clvsMp8J22CyyV2OARhOdo2Dq9RTi33qe80DUk/iH0LPaWORXbj1uHti8q8YCwouMP05+yssQG3XctJu9Yt3VAb5Be6BZgn4UWlbdMLwvf0Bb27YfhCIX9nWYxqkpsT5eIdyyXhTeKx4bMThmN2cfLxFB8PosqjeoSh6dOY1ggHhBe6D3gvWFIbX3G7HOGvtWi3MThRe7Xzvt8HKMyauszhqs8PGni8t5aRq+HAAAA//++iSM6AAAABklEQVQDAPdMuT25PGg0AAAAAElFTkSuQmCC";

// ============================================================
// SESSION / AUTH
// ============================================================

function getUser() {
  try { return JSON.parse(localStorage.getItem('investx_user')); } catch { return null; }
}

function saveUser(u) {
  localStorage.setItem('investx_user', JSON.stringify(u));
}

function requireAuth() {
  if (!getUser()) { window.location.href = 'login.html'; }
}

function logout() {
  localStorage.removeItem('investx_user');
  window.location.href = 'login.html';
}

// ============================================================
// DADOS DE MERCADO EM TEMPO REAL (via APIs públicas gratuitas)
// ============================================================

// Cache dos preços
const marketCache = {};

// Busca cotações reais via Yahoo Finance (proxy CORS)
async function fetchRealPrice(symbol) {
  try {
    // Usa a API pública do Yahoo Finance
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

// Mapeamento de tickers para Yahoo Finance
const YF_MAP = {
  'PETR4': 'PETR4.SA', 'VALE3': 'VALE3.SA', 'ITUB4': 'ITUB4.SA',
  'BBDC4': 'BBDC4.SA', 'MGLU3': 'MGLU3.SA', 'WEGE3': 'WEGE3.SA',
  'MXRF11': 'MXRF11.SA', 'HGLG11': 'HGLG11.SA', 'XPLG11': 'XPLG11.SA', 'VISC11': 'VISC11.SA',
  'BTC': 'BTC-USD', 'ETH': 'ETH-USD', 'SOL': 'SOL-USD', 'XRP': 'XRP-USD',
  'IBOV': '^BVSP', 'NASDAQ': '^IXIC',
};

// Formata preço para exibição
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

// Dados de fallback (estáticos) se a API falhar
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

// Estado atual da tabela
let currentMarketData = JSON.parse(JSON.stringify(MKT_FALLBACK));
let currentMarketKey = 'acoes';

// Atualiza preços reais em background
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

      // Atualiza nos dados
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

      // Re-renderiza se aba ativa
      if (document.getElementById('marketBody')) {
        renderMarketTable(currentMarketKey);
      }

      // Atualiza ticker da landing
      updateLandingTicker();

      // Atualiza sidebar mini
      updateSidebarMini();
    } catch {}
  }
}

// ============================================================
// TICKER — LANDING PAGE (contínuo, sem corte)
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
  // Duplica para looping contínuo
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
// TOPBAR
// ============================================================

function populateTopbar() {
  const user = getUser();
  if (!user) return;
  const av = document.querySelector('.user-avatar');
  if (!av) return;
  if (user.avatar) {
    av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
  } else {
    const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    av.textContent = initials;
  }
  av.title = user.name || 'Perfil';
}

// ============================================================
// SIDEBAR / OVERLAY
// ============================================================

function toggleSidebar() {
  const s = document.getElementById('sidebar');
  const o = document.getElementById('overlay');
  const c = document.getElementById('chatPanel');
  if (s) s.classList.toggle('open');
  if (c) c.classList.remove('open');
  if (o) o.classList.toggle('show', s && s.classList.contains('open'));
}

function toggleChat() {
  const c = document.getElementById('chatPanel');
  const o = document.getElementById('overlay');
  const s = document.getElementById('sidebar');
  if (c) c.classList.toggle('open');
  if (s) s.classList.remove('open');
  if (o) o.classList.toggle('show', c && c.classList.contains('open'));
}

function closeAll() {
  const s = document.getElementById('sidebar');
  const c = document.getElementById('chatPanel');
  const o = document.getElementById('overlay');
  if (s) s.classList.remove('open');
  if (c) c.classList.remove('open');
  if (o) o.classList.remove('show');
}

// ============================================================
// NAVEGAÇÃO
// ============================================================

const navLabels = {
  dashboard:'dashboard', portfolio:'portfólio',
  mercado:'mercado', analise:'análise', alertas:'alertas', negociar:'negociar'
};

function navigate(page) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  const view = document.getElementById('view-' + page);
  if (view) view.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(b => {
    const t = b.textContent.trim().toLowerCase();
    if (t.includes(navLabels[page] || page)) b.classList.add('active');
  });
  if (window.innerWidth <= 900) closeAll();
  if (page === 'mercado') renderMarketTable('acoes');
  if (page === 'negociar') { runSimulation(); updateTradePrice('buy'); }
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

// ============================================================
// ALERTAS
// ============================================================

function dismissAlert(btn) {
  const art = btn.closest('article');
  art.style.opacity = '0.35';
  btn.disabled = true;
  btn.textContent = 'Dispensado';
}

function createAlert() {
  const asset = document.getElementById('alert-asset')?.value.trim();
  const type  = document.getElementById('alert-type')?.value;
  const value = document.getElementById('alert-value')?.value.trim();
  if (!asset || !value) { alert('Preencha o ativo e o valor.'); return; }
  document.getElementById('alert-asset').value = '';
  document.getElementById('alert-value').value = '';
  const c = document.getElementById('alertsContainer');
  if (!c) return;
  const el = document.createElement('article');
  el.className = 'alert-item';
  el.innerHTML = `
    <span class="alert-icon-wrap gray">🔔</span>
    <span class="alert-body">
      <p class="alert-title">${asset.toUpperCase()} — ${type} ${value}</p>
      <p class="alert-desc">Alerta configurado. OMEGA IA vai notificar quando a condição for atingida.</p>
      <span class="alert-meta">
        <span class="alert-asset">${asset.toUpperCase()}</span>
        <time class="alert-time-tag">agora mesmo</time>
      </span>
    </span>
    <span class="alert-action">
      <button class="btn-dismiss" onclick="this.closest('article').remove()">Remover</button>
    </span>`;
  c.prepend(el);
}

// ============================================================
// GRÁFICO — DADOS REAIS via Yahoo Finance
// ============================================================

let currentChartKey = '1D';
let currentChartAsset = 'PETR4';
let currentChartPoints = null;
let currentChartValues = null;

const CHART_INTERVALS = {
  '1D': { interval: '5m',  range: '1d'  },
  '1S': { interval: '30m', range: '5d'  },
  '1M': { interval: '1d',  range: '1mo' },
  '3M': { interval: '1d',  range: '3mo' },
  '1A': { interval: '1wk', range: '1y'  },
};

// Fallback de dados do gráfico
const CHART_FALLBACK = {
  '1D':[165,158,162,170,168,172,175,168,163,158,160,155,162,170,175,178,172,168,165,163,170,175,180,172,168],
  '1S':[170,162,175,185,178,172,168,175,182,188,185,178,172,168,162,158,162,168,175,182,188,185,178,175,180],
  '1M':[140,148,155,150,162,170,165,158,162,168,175,180,172,165,158,162,170,178,185,178,172,168,175,180,185],
  '3M':[100,110,120,115,125,130,125,135,140,135,145,150,145,155,160,155,165,158,165,172,168,175,180,175,180],
  '1A':[80,90,100,95,110,120,115,125,130,140,135,145,150,145,155,148,162,158,165,172,168,175,182,178,180],
};

async function fetchChartData(symbol, period) {
  try {
    const yfSym = YF_MAP[symbol] || symbol;
    const { interval, range } = CHART_INTERVALS[period] || CHART_INTERVALS['1D'];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yfSym}?interval=${interval}&range=${range}`;
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error('fail');
    const json = await res.json();
    const closes = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close;
    if (!closes || closes.length < 5) throw new Error('no data');
    // Remove nulls
    return closes.filter(v => v != null);
  } catch {
    return null;
  }
}

function drawChart(data) {
  if (!data || data.length < 2) data = CHART_FALLBACK[currentChartKey] || CHART_FALLBACK['1D'];
  currentChartValues = data;

  const W = 600, H = 220, PAD = 30, BOT = 25;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    PAD + (i / (data.length - 1)) * (W - PAD * 2),
    BOT + ((max - v) / range) * (H - BOT * 2)
  ]);
  currentChartPoints = pts;

  const lp = 'M' + pts.map(p => p.join(',')).join('L');
  document.getElementById('chartLine')?.setAttribute('d', lp);
  document.getElementById('chartArea')?.setAttribute('d', lp + `L${pts[pts.length-1][0]},${H-BOT} L${pts[0][0]},${H-BOT} Z`);

  const svg = document.querySelector('.chart-svg');
  if (svg) { svg._pts = pts; svg._data = data; }

  // Atualiza preço exibido
  const lastPrice = data[data.length - 1];
  const firstPrice = data[0];
  const pctChg = ((lastPrice - firstPrice) / firstPrice * 100);
  const up = pctChg >= 0;

  const liveEl = document.getElementById('livePrice');
  if (liveEl) liveEl.textContent = 'R$ ' + lastPrice.toFixed(2).replace('.', ',');

  const deltaEl = document.getElementById('liveDelta');
  if (deltaEl) {
    deltaEl.textContent = (up ? '▲ +' : '▼ ') + pctChg.toFixed(2) + '%';
    deltaEl.className = 'chart-asset-change ' + (up ? 'up' : 'dn');
  }
}

async function setTab(el, key) {
  currentChartKey = key;
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  // Mostra loading
  const chartLine = document.getElementById('chartLine');
  if (chartLine) chartLine.style.opacity = '0.3';

  const data = await fetchChartData(currentChartAsset, key);
  if (chartLine) chartLine.style.opacity = '1';
  drawChart(data || CHART_FALLBACK[key]);
}

async function selectAsset(name, price, pct) {
  currentChartAsset = name;
  const nameEl = document.querySelector('.chart-asset-name');
  if (nameEl) nameEl.textContent = name;

  const chartLine = document.getElementById('chartLine');
  if (chartLine) chartLine.style.opacity = '0.3';

  const data = await fetchChartData(name, currentChartKey);
  if (chartLine) chartLine.style.opacity = '1';
  drawChart(data || CHART_FALLBACK[currentChartKey]);
}

// ---- Tooltip do gráfico ----
function initChartTooltip() {
  const wrapper = document.querySelector('.chart-wrapper');
  const svg     = document.querySelector('.chart-svg');
  if (!wrapper || !svg) return;

  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  const dot  = document.createElement('div');
  dot.className = 'chart-tooltip-dot';
  const line = document.createElement('div');
  line.className = 'chart-tooltip-line';
  wrapper.appendChild(line);
  wrapper.appendChild(dot);
  wrapper.appendChild(tooltip);

  wrapper.addEventListener('mousemove', e => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relX = x / rect.width;
    const pts  = svg._pts;
    const data = svg._data;
    if (!pts || !data) return;
    const idx = Math.round(relX * (pts.length - 1));
    const clamped = Math.max(0, Math.min(pts.length - 1, idx));
    const [px, py] = pts[clamped];
    const svgW = 600, svgH = 220;
    const dotX = (px / svgW) * rect.width;
    const dotY = (py / svgH) * rect.height;
    const val  = data[clamped];
    dot.style.left = dotX + 'px'; dot.style.top = dotY + 'px'; dot.style.opacity = '1';
    line.style.left = dotX + 'px'; line.style.opacity = '1';
    tooltip.textContent = `R$ ${val.toFixed(2)}`;
    const tw = tooltip.offsetWidth;
    let tx = dotX + 12;
    if (tx + tw > rect.width - 10) tx = dotX - tw - 12;
    tooltip.style.left = tx + 'px';
    tooltip.style.top  = (dotY - 28) + 'px';
    tooltip.style.opacity = '1';
  });

  wrapper.addEventListener('mouseleave', () => {
    dot.style.opacity = '0';
    line.style.opacity = '0';
    tooltip.style.opacity = '0';
  });
}

// ---- Ticker ao vivo do preço no dashboard ----
function startLivePriceTicker() {
  setInterval(async () => {
    const el = document.getElementById('livePrice');
    if (!el || !currentChartAsset) return;
    const yfSym = YF_MAP[currentChartAsset];
    if (!yfSym) return;
    try {
      const data = await fetchRealPrice(yfSym);
      if (data && data.price) {
        el.textContent = 'R$ ' + data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const deltaEl = document.getElementById('liveDelta');
        if (deltaEl) {
          const sign = data.up ? '+' : '';
          deltaEl.textContent = (data.up ? '▲ ' : '▼ ') + sign + data.chg.toFixed(2) + '%';
          deltaEl.className = 'chart-asset-change ' + (data.up ? 'up' : 'dn');
        }
      }
    } catch {}
  }, 15000); // atualiza a cada 15 segundos
}

// ============================================================
// CHAT — OMEGA IA (Anthropic API)
// ============================================================

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

// Injeta preços reais no contexto da IA
function buildMarketContext() {
  const acoes = currentMarketData.acoes.slice(0, 3).map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');
  const cripto = currentMarketData.cripto.slice(0, 2).map(r => `${r.tick} ${r.price} (${r.chg})`).join(', ');
  const ibov = currentMarketData.indices[0];
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


// Chave de API (Google AI Studio)
// ============================================================
// CHAT — OMEGA IA via Groq API (llama-3.3-70b)
// ============================================================
// CHAMADA AO PROXY VERCEL — chave de API nunca exposta ao cliente
// A função serverless em /api/chat injeta a ANTHROPIC_API_KEY
// a partir das variáveis de ambiente configuradas na Vercel.
// ============================================================

async function callOmegaIA(userMessage) {
  const marketCtx = buildMarketContext();

  // Histórico no formato Anthropic (user / assistant alternados)
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
  // Remove emoji/ícone do início (qualquer char não-letra seguido de espaço)
  const raw = el.textContent.trim();
  const cleaned = raw.replace(/^[\p{Emoji}\p{So}\p{Sm}]+\s*/u, '');
  input.value = cleaned || raw;
  sendMessage();
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 80) + 'px';
}

// ============================================================
// AUTH — REGISTER
// ============================================================

function initAvatarPicker(previewId, inputId) {
  const preview = document.getElementById(previewId);
  const input   = document.getElementById(inputId);
  if (!preview || !input) return;
  preview.addEventListener('click', () => input.click());
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span class="avatar-overlay">📷</span>`;
      preview.dataset.avatarData = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function handleRegister(e) {
  e.preventDefault();
  let ok = true;
  const name  = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim();
  const pass  = document.getElementById('reg-pass')?.value;
  const pass2 = document.getElementById('reg-pass2')?.value;
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
  if (!name) { showFieldError('err-name', 'reg-name', 'Digite seu nome'); ok = false; }
  if (!email || !email.includes('@')) { showFieldError('err-email', 'reg-email', 'E-mail inválido'); ok = false; }
  if (!pass || pass.length < 6) { showFieldError('err-pass', 'reg-pass', 'Mínimo 6 caracteres'); ok = false; }
  if (pass !== pass2) { showFieldError('err-pass2', 'reg-pass2', 'Senhas não coincidem'); ok = false; }
  if (!ok) return;

  // Verifica se já existe conta com esse e-mail
  const existing = getAllAccounts();
  if (existing.find(u => u.email === email)) {
    showFieldError('err-email', 'reg-email', 'Este e-mail já está cadastrado');
    return;
  }

  const avatarData = document.getElementById('avatarPreview')?.dataset.avatarData || null;
  const initials   = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  const user = { name, email, pass, initials, avatar: avatarData, createdAt: new Date().toISOString() };

  // Salva na lista de contas e como usuário atual
  saveAccount(user);
  localStorage.setItem('investx_user', JSON.stringify(user));
  window.location.href = 'index.html';
}

// ============================================================
// AUTH — MULTIPLE ACCOUNTS STORAGE
// ============================================================

function getAllAccounts() {
  try { return JSON.parse(localStorage.getItem('investx_accounts')) || []; } catch { return []; }
}

function saveAccount(user) {
  const accounts = getAllAccounts();
  const idx = accounts.findIndex(u => u.email === user.email);
  if (idx >= 0) accounts[idx] = user;
  else accounts.push(user);
  localStorage.setItem('investx_accounts', JSON.stringify(accounts));
}

// ============================================================
// AUTH — LOGIN (só permite se tiver conta cadastrada)
// ============================================================

function handleLogin(e) {
  e.preventDefault();
  let ok = true;
  const email = document.getElementById('login-email')?.value.trim();
  const pass  = document.getElementById('login-pass')?.value;
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.auth-input').forEach(el => el.classList.remove('error'));
  if (!email) { showFieldError('err-email', 'login-email', 'Digite seu e-mail'); ok = false; }
  if (!pass)  { showFieldError('err-pass',  'login-pass',  'Digite sua senha');  ok = false; }
  if (!ok) return;

  // Conta demo especial
  if (email === 'demo@investx.com' && pass === 'demo123') {
    const demoUser = {
      name: 'Victor Ferreira', email, pass: 'demo123',
      initials: 'VF', avatar: null, createdAt: '2023-01-15T00:00:00Z'
    };
    localStorage.setItem('investx_user', JSON.stringify(demoUser));
    window.location.href = 'index.html';
    return;
  }

  // Busca nas contas cadastradas
  const accounts = getAllAccounts();
  const found = accounts.find(u => u.email === email);

  if (!found) {
    showFieldError('err-email', 'login-email', 'Conta não encontrada. Cadastre-se primeiro.');
    return;
  }

  if (found.pass !== pass) {
    showFieldError('err-pass', 'login-pass', 'Senha incorreta');
    return;
  }

  localStorage.setItem('investx_user', JSON.stringify(found));
  window.location.href = 'index.html';
}

function showFieldError(errId, inputId, msg) {
  const err = document.getElementById(errId);
  const inp = document.getElementById(inputId);
  if (err) { err.textContent = msg; err.classList.add('show'); }
  if (inp) inp.classList.add('error');
}

function togglePassVis(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁'; }
}

// ============================================================
// PROFILE
// ============================================================

function formatDate(iso) {
  if (!iso) return 'Jan 2023';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

function populateProfile() {
  const user = getUser();
  if (!user) return;
  const av = document.querySelector('.avatar-large');
  if (av) {
    if (user.avatar) {
      av.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;"><span class="avatar-overlay">📷</span>`;
    } else {
      av.innerHTML = `<span>${user.initials || 'U'}</span><span class="avatar-overlay">📷</span>`;
    }
    av.addEventListener('click', () => document.getElementById('profileAvatarInput')?.click());
  }
  const heroH2 = document.querySelector('.profile-info h2');
  if (heroH2 && user.name) {
    const parts = user.name.split(' ');
    heroH2.innerHTML = `<em>${parts[0].toUpperCase()}</em> ${parts.slice(1).join(' ').toUpperCase()}`;
  }
  const heroP = document.querySelector('.profile-info > p');
  if (heroP && user.email) heroP.textContent = user.email + ' · Membro desde ' + formatDate(user.createdAt);
  const nameInput = document.getElementById('p-name');
  if (nameInput) nameInput.value = user.name || '';
  const emailInput = document.getElementById('p-email');
  if (emailInput) emailInput.value = user.email || '';
  populateTopbar();
}

function saveProfile() {
  const user  = getUser() || {};
  const name  = document.getElementById('p-name')?.value.trim();
  const email = document.getElementById('p-email')?.value.trim();
  const perfil = document.getElementById('p-perfil')?.value;
  if (name)  { user.name = name; user.initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
  if (email) user.email = email;
  if (perfil) user.perfil = perfil;
  saveUser(user);
  saveAccount(user); // mantém contas sincronizadas
  populateProfile();
  const btn = document.querySelector('.btn-save');
  if (btn) { btn.textContent = 'SALVO ✓'; setTimeout(() => { btn.textContent = 'SALVAR ALTERAÇÕES'; }, 2000); }
}

function initAvatarUpload() {
  const input = document.getElementById('profileAvatarInput');
  if (!input) return;
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const user = getUser() || {};
      user.avatar = ev.target.result;
      saveUser(user);
      saveAccount(user);
      populateProfile();
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================
// API KEY MANAGEMENT
// ============================================================

function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  if (!input || !input.value.trim()) return;
  const key = input.value.trim();
  localStorage.setItem('investx_api_key', key);
  input.value = '';
  document.getElementById('apiKeyBanner').style.display = 'none';
  // Atualiza status
  const statusEl = document.querySelector('.chat-ai-status');
  if (statusEl) statusEl.textContent = 'online · pronta para responder';
  // Envia mensagem de confirmação
  appendMessage('✅ Chave de API salva! Agora posso responder **qualquer pergunta** — finanças, tecnologia, ciência, curiosidades e muito mais. Como posso ajudar?', false);
}

function checkApiKeyStatus() {
  const key = localStorage.getItem('investx_api_key');
  const banner = document.getElementById('apiKeyBanner');
  const statusEl = document.querySelector('.chat-ai-status');
  if (!key) {
    if (banner) banner.style.display = 'block';
    if (statusEl) statusEl.textContent = '⚠ chave de API necessária';
  } else {
    if (banner) banner.style.display = 'none';
    if (statusEl) statusEl.textContent = 'online · IA ativa';
  }
}

// ============================================================
// NEGOCIAR — TRADING / SIMULAÇÃO
// ============================================================

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

  // Update info panel
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

  // Adiciona à tabela de ordens
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

  // Toast de confirmação
  const toast = document.createElement('div');
  toast.style.cssText = `position:fixed;bottom:30px;right:30px;background:var(--card);border:1px solid var(--red-bright);border-radius:8px;padding:16px 24px;font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--white);z-index:9999;box-shadow:0 0 30px rgba(220,38,38,.3);animation:fadeIn .3s ease;`;
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

  // Calcula valor final com juros compostos + aportes mensais
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

  const info = TRADE_ASSETS[tick] || {};
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

document.addEventListener('DOMContentLoaded', () => {
  // Init trading tab
  setTimeout(() => { updateTradePrice('buy'); runSimulation(); }, 500);
});

document.addEventListener('DOMContentLoaded', async () => {
  // Topbar
  populateTopbar();

  // Auth forms
  initAvatarPicker('avatarPreview', 'avatarInput');
  document.getElementById('registerForm')?.addEventListener('submit', handleRegister);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

  // Profile
  if (document.querySelector('.avatar-large')) {
    populateProfile();
    initAvatarUpload();
    document.querySelector('.btn-save')?.addEventListener('click', saveProfile);
  }

  // Dashboard chart + ticker
  if (document.getElementById('chartLine')) {
    const data = await fetchChartData('PETR4', '1D');
    drawChart(data || CHART_FALLBACK['1D']);
    initChartTooltip();
    startLivePriceTicker();
  }

  // Barra de preços da landing page
  if (document.getElementById('tickerTrack')) {
    initLandingTicker();
    // Atualiza preços em tempo real
    refreshRealPrices().then(() => {
      updateLandingTicker();
    });
    // Refresca a cada 60 segundos
    setInterval(async () => {
      await refreshRealPrices();
      updateLandingTicker();
    }, 60000);
  }

  // Tabela de mercado — atualiza em tempo real
  if (document.getElementById('marketBody')) {
    renderMarketTable('acoes');
    refreshRealPrices().then(() => renderMarketTable(currentMarketKey));
    setInterval(() => {
      refreshRealPrices().then(() => renderMarketTable(currentMarketKey));
    }, 30000);
  }

  // Personaliza boas-vindas no chat
  const user = getUser();
  if (user) {
    const firstMsg = document.querySelector('#chatMessages .msg-bubble');
    if (firstMsg && user.name) {
      const firstName = user.name.split(' ')[0];
      firstMsg.innerHTML = `Olá, <strong>${firstName}</strong>! 👋 Estou monitorando seu portfólio com dados em tempo real. <strong>PETR4</strong> subiu +2,3% — pode ser bom momento para revisar sua posição.`;
    }
  }

  // Navegação por hash
  const hash = window.location.hash.replace('#', '');
  const validPages = ['dashboard','portfolio','mercado','analise','alertas'];
  if (hash && validPages.includes(hash)) navigate(hash);
});