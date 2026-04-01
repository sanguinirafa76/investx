/* ============================================================
   InvestX — chart.js  (VERSÃO TEMPO REAL COMPLETA)
   Gráfico SVG com tooltip interativo + live price ticker
   Usa proxy Vercel (/api/market) para resolver CORS
   ============================================================ */

let currentChartKey    = '1D';
let currentChartAsset  = 'PETR4';
let currentChartPoints = null;
let currentChartValues = null;

// Expõe ao market.js para que o loop de 60s possa recarregar
window.currentChartAsset = currentChartAsset;
window.currentChartKey   = currentChartKey;

const CHART_INTERVALS = {
  '1D': { interval: '5m',  range: '1d'  },
  '1S': { interval: '30m', range: '5d'  },
  '1M': { interval: '1d',  range: '1mo' },
  '3M': { interval: '1d',  range: '3mo' },
  '1A': { interval: '1wk', range: '1y'  },
};

const CHART_FALLBACK = {
  '1D':[165,158,162,170,168,172,175,168,163,158,160,155,162,170,175,178,172,168,165,163,170,175,180,172,168],
  '1S':[170,162,175,185,178,172,168,175,182,188,185,178,172,168,162,158,162,168,175,182,188,185,178,175,180],
  '1M':[140,148,155,150,162,170,165,158,162,168,175,180,172,165,158,162,170,178,185,178,172,168,175,180,185],
  '3M':[100,110,120,115,125,130,125,135,140,135,145,150,145,155,160,155,165,158,165,172,168,175,180,175,180],
  '1A':[80,90,100,95,110,120,115,125,130,140,135,145,150,145,155,148,162,158,165,172,168,175,182,178,180],
};

// ============================================================
// BUSCA DADOS DO GRÁFICO VIA PROXY
// ============================================================
async function fetchChartData(symbol, period) {
  try {
    const yfMap = window.YF_MAP || {};
    const yfSym = yfMap[symbol] || symbol;
    const { interval, range } = CHART_INTERVALS[period] || CHART_INTERVALS['1D'];

    const params = new URLSearchParams({ symbols: yfSym, interval, range });
    const res    = await fetch(`/api/market?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json   = await res.json();
    const d      = json.data?.[yfSym];
    if (!d || d.error) throw new Error('sem dados');

    const closes = d.chart?.closes?.filter(v => v !== null);
    if (!closes || closes.length < 5) throw new Error('poucos pontos');

    return closes;
  } catch (err) {
    console.warn('[chart] fetchChartData falhou:', err.message);
    return null;
  }
}

// ============================================================
// RÓTULOS DE EIXO — gerados dinamicamente por período
// ============================================================
function getAxisLabels(period, dataLen) {
  const now = new Date();

  if (period === '1D') {
    // Horários de pregão: 09h–17h
    const labels = [];
    for (let i = 0; i <= 4; i++) labels.push(`${9 + i * 2}h`);
    return { x: labels, y: null };
  }
  if (period === '1S') {
    const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    const labels = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      labels.push(days[d.getDay()]);
    }
    return { x: labels, y: null };
  }
  if (period === '1M') {
    const labels = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i * 7);
      labels.push(`${d.getDate()}/${d.getMonth()+1}`);
    }
    return { x: labels, y: null };
  }
  if (period === '3M') {
    const labels = [];
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now); d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleString('pt-BR', { month: 'short' }));
    }
    return { x: labels, y: null };
  }
  if (period === '1A') {
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now); d.setMonth(d.getMonth() - i * 2);
      labels.push(d.toLocaleString('pt-BR', { month: 'short' }));
    }
    return { x: labels, y: null };
  }
  return { x: [], y: null };
}

// ============================================================
// DESENHO DO GRÁFICO SVG
// ============================================================
function drawChart(data) {
  if (!data || data.length < 2) data = CHART_FALLBACK[currentChartKey] || CHART_FALLBACK['1D'];
  currentChartValues = data;

  const W = 600, H = 220, PAD = 38, BOT = 25;
  const min   = Math.min(...data);
  const max   = Math.max(...data);
  const range = max - min || 1;

  // Calcula pontos SVG
  const pts = data.map((v, i) => [
    PAD + (i / (data.length - 1)) * (W - PAD * 2),
    BOT + ((max - v) / range) * (H - BOT * 2),
  ]);
  currentChartPoints = pts;

  const lp = 'M' + pts.map(p => p.join(',')).join('L');
  document.getElementById('chartLine')?.setAttribute('d', lp);
  document.getElementById('chartArea')?.setAttribute('d',
    lp + `L${pts[pts.length - 1][0]},${H - BOT} L${pts[0][0]},${H - BOT} Z`
  );

  // Salva nos elementos SVG para o tooltip
  const svg = document.querySelector('.chart-svg');
  if (svg) { svg._pts = pts; svg._data = data; }

  // Atualiza rótulos do eixo Y dinamicamente
  updateChartYLabels(min, max, H, BOT);

  // Atualiza rótulos do eixo X
  updateChartXLabels(currentChartKey);

  // Calcula variação para o cabeçalho
  const lastPrice  = data[data.length - 1];
  const firstPrice = data[0];
  const pctChg     = ((lastPrice - firstPrice) / firstPrice * 100);
  const up         = pctChg >= 0;

  // Preço ao vivo
  const liveEl = document.getElementById('livePrice');
  if (liveEl) {
    const cached = window.marketCache?.[currentChartAsset];
    liveEl.textContent = cached
      ? (window.formatPrice ? window.formatPrice(currentChartAsset, cached.price) : `R$ ${cached.price.toFixed(2).replace('.',',')}`)
      : `R$ ${lastPrice.toFixed(2).replace('.',',')}`;
  }

  // Variação
  const deltaEl = document.getElementById('liveDelta');
  if (deltaEl) {
    // Usa dado real do cache se disponível
    const cached = window.marketCache?.[currentChartAsset];
    if (cached) {
      const s = cached.up ? '+' : '';
      deltaEl.textContent = `${cached.up ? '▲ ' : '▼ '}${s}${cached.chg.toFixed(2)}%`;
      deltaEl.className   = 'chart-asset-change ' + (cached.up ? 'up' : 'dn');
    } else {
      deltaEl.textContent = `${up ? '▲ +' : '▼ '}${pctChg.toFixed(2)}%`;
      deltaEl.className   = 'chart-asset-change ' + (up ? 'up' : 'dn');
    }
  }

  // Linha de cor: verde se alta, vermelho se queda
  const chartLine = document.getElementById('chartLine');
  const chartArea = document.getElementById('chartArea');
  if (chartLine && chartArea) {
    const colorUp = '#dc2626'; // mantém identidade visual da marca
    chartLine.style.stroke = colorUp;
  }

  // Animação de fade-in
  if (chartLine) { chartLine.style.opacity = '0'; requestAnimationFrame(() => { chartLine.style.transition = 'opacity 0.4s'; chartLine.style.opacity = '1'; }); }
}

// ============================================================
// RÓTULOS Y DINÂMICOS
// ============================================================
function updateChartYLabels(min, max, H, BOT) {
  const labels = document.querySelectorAll('.chart-label-y');
  if (!labels.length) return;
  const steps = labels.length;
  labels.forEach((el, i) => {
    const val = max - (i / (steps - 1)) * (max - min);
    el.textContent = val >= 1000
      ? 'R$' + Math.round(val).toLocaleString('pt-BR')
      : 'R$' + val.toFixed(2).replace('.',',');
  });
}

// ============================================================
// RÓTULOS X DINÂMICOS
// ============================================================
function updateChartXLabels(period) {
  const labels = document.querySelectorAll('.chart-label-x');
  if (!labels.length) return;
  const { x } = getAxisLabels(period, currentChartValues?.length || 25);
  labels.forEach((el, i) => {
    if (x[i] !== undefined) el.textContent = x[i];
  });
}

// ============================================================
// TABS DE PERÍODO
// ============================================================
async function setTab(el, key) {
  currentChartKey = key;
  window.currentChartKey = key;
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');

  const chartLine = document.getElementById('chartLine');
  if (chartLine) chartLine.style.opacity = '0.3';

  const data = await fetchChartData(currentChartAsset, key);
  drawChart(data || CHART_FALLBACK[key]);
}

// ============================================================
// SELEÇÃO DE ATIVO — chamada dos port-cards e da tabela
// ============================================================
async function selectAsset(name) {
  currentChartAsset = name;
  window.currentChartAsset = name;

  const nameEl = document.querySelector('.chart-asset-name');
  if (nameEl) nameEl.textContent = name;

  const chartLine = document.getElementById('chartLine');
  if (chartLine) chartLine.style.opacity = '0.3';

  const data = await fetchChartData(name, currentChartKey);
  drawChart(data || CHART_FALLBACK[currentChartKey]);
}

// ============================================================
// TOOLTIP INTERATIVO
// ============================================================
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
    const x    = e.clientX - rect.left;
    const relX = x / rect.width;
    const pts  = svg._pts;
    const data = svg._data;
    if (!pts || !data) return;

    const idx     = Math.round(relX * (pts.length - 1));
    const clamped = Math.max(0, Math.min(pts.length - 1, idx));
    const [px, py] = pts[clamped];
    const svgW = 600, svgH = 220;
    const dotX = (px / svgW) * rect.width;
    const dotY = (py / svgH) * rect.height;
    const val  = data[clamped];

    dot.style.left     = dotX + 'px';
    dot.style.top      = dotY + 'px';
    dot.style.opacity  = '1';
    line.style.left    = dotX + 'px';
    line.style.opacity = '1';

    const formatted = val >= 1000
      ? 'R$ ' + Math.round(val).toLocaleString('pt-BR')
      : `R$ ${val.toFixed(2).replace('.',',')}`;

    tooltip.textContent = formatted;
    const tw = tooltip.offsetWidth;
    let tx = dotX + 12;
    if (tx + tw > rect.width - 10) tx = dotX - tw - 12;
    tooltip.style.left    = tx + 'px';
    tooltip.style.top     = (dotY - 28) + 'px';
    tooltip.style.opacity = '1';
  });

  wrapper.addEventListener('mouseleave', () => {
    dot.style.opacity     = '0';
    line.style.opacity    = '0';
    tooltip.style.opacity = '0';
  });
}

// ============================================================
// LIVE PRICE TICKER — sincroniza livePrice com marketCache a cada 15s
// ============================================================
function startLivePriceTicker() {
  setInterval(() => {
    const cached = window.marketCache?.[currentChartAsset];
    if (!cached) return;

    const liveEl = document.getElementById('livePrice');
    if (liveEl && window.formatPrice) liveEl.textContent = window.formatPrice(currentChartAsset, cached.price);

    const deltaEl = document.getElementById('liveDelta');
    if (deltaEl) {
      const sign = cached.up ? '+' : '';
      deltaEl.textContent = `${cached.up ? '▲ ' : '▼ '}${sign}${cached.chg.toFixed(2)}%`;
      deltaEl.className   = 'chart-asset-change ' + (cached.up ? 'up' : 'dn');
    }
  }, 15_000);
}

// ============================================================
// INICIALIZAÇÃO DO MÓDULO DE GRÁFICO
// ============================================================
(async function initChart() {
  // Aguarda market.js carregar (que é carregado antes)
  await new Promise(r => setTimeout(r, 500));

  // Desenha com dados reais
  const data = await fetchChartData(currentChartAsset, currentChartKey);
  drawChart(data || CHART_FALLBACK[currentChartKey]);

  // Ativa tooltip
  initChartTooltip();

  // Ativa ticker de preço ao vivo
  startLivePriceTicker();
})();
