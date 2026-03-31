/* ============================================================
   InvestX — home.js
   Scripts específicos da Landing Page
   ============================================================ */

// Relógio no mockup
  function updateMockupTime() {
    const el = document.getElementById('mockupTime');
    if (el) el.textContent = new Date().toLocaleTimeString('pt-BR');
  }
  updateMockupTime();
  setInterval(updateMockupTime, 1000);

  // Atualiza preços nos cards da landing
  async function updateLandingPrices() {
    const map = {
      'PETR4': { elPrice: 'lpc-petr4', elChg: 'lpc-petr4-chg', yfSym: 'PETR4.SA' },
      'VALE3': { elPrice: 'lpc-vale3', elChg: 'lpc-vale3-chg', yfSym: 'VALE3.SA' },
      'BTC':   { elPrice: 'lpc-btc',   elChg: 'lpc-btc-chg',   yfSym: 'BTC-USD'  },
      'IBOV':  { elPrice: 'lpc-ibov',  elChg: 'lpc-ibov-chg',  yfSym: '^BVSP'    },
      'ETH':   { elPrice: 'lpc-eth',   elChg: 'lpc-eth-chg',   yfSym: 'ETH-USD'  },
      'ITUB4': { elPrice: 'lpc-itub4', elChg: 'lpc-itub4-chg', yfSym: 'ITUB4.SA' },
      'WEGE3': { elPrice: 'lpc-wege3', elChg: 'lpc-wege3-chg', yfSym: 'WEGE3.SA' },
      'SOL':   { elPrice: 'lpc-sol',   elChg: 'lpc-sol-chg',   yfSym: 'SOL-USD'  },
    };

    for (const [tick, cfg] of Object.entries(map)) {
      try {
        const data = await fetchRealPrice(cfg.yfSym);
        if (!data || !data.price) continue;
        const priceEl = document.getElementById(cfg.elPrice);
        const chgEl   = document.getElementById(cfg.elChg);
        if (priceEl) priceEl.textContent = formatPrice(tick, data.price);
        if (chgEl) {
          const sign = data.up ? '+' : '';
          chgEl.textContent = (data.up ? '▲ ' : '▼ ') + sign + data.chg.toFixed(2) + '%';
          chgEl.className = 'lpc-chg ' + (data.up ? 'up' : 'dn');
        }
      } catch {}
    }

    const lastEl = document.getElementById('lastUpdateTime');
    if (lastEl) lastEl.textContent = new Date().toLocaleTimeString('pt-BR');
  }

  // Inicializa
  document.addEventListener('DOMContentLoaded', () => {
    // Ticker contínuo — garante que o conteúdo é o dobro para loop sem corte
    initLandingTicker();
    // Busca preços reais
    updateLandingPrices();
    setInterval(updateLandingPrices, 60000);
  });