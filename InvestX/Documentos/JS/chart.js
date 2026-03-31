/* ============================================================
   InvestX — chart.js
   Gráfico SVG, tooltip interativo, live price ticker
   ============================================================ */

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

// ---- Live price ticker no dashboard ----
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
  }, 15000);
}
