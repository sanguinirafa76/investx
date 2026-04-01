/* ============================================================
   InvestX — api/market.js
   Proxy Vercel para Yahoo Finance — resolve CORS em produção
   ============================================================ */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { symbols, interval = '5m', range = '1d' } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'Parâmetro "symbols" ausente.' });
  }

  // Cache de 30s no edge da Vercel
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=10');

  const symbolList = symbols.split(',').map(s => s.trim()).filter(Boolean);

  try {
    const results = {};

    await Promise.all(symbolList.map(async (symbol) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; InvestX/1.0)',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const json = await response.json();
        const result = json.chart?.result?.[0];

        if (!result) throw new Error('Sem dados');

        const meta       = result.meta;
        const price      = meta.regularMarketPrice;
        const prevClose  = meta.previousClose || meta.chartPreviousClose || price;
        const chg        = prevClose ? ((price - prevClose) / prevClose * 100) : 0;
        const timestamps = result.timestamp || [];
        const closes     = result.indicators?.quote?.[0]?.close || [];

        results[symbol] = {
          symbol,
          price,
          prevClose,
          chg:       parseFloat(chg.toFixed(2)),
          up:        chg >= 0,
          currency:  meta.currency || 'USD',
          name:      meta.longName || meta.shortName || symbol,
          // Dados do gráfico — filtra nulls
          chart: {
            timestamps,
            closes: closes.map((v, i) => v === null ? null : parseFloat(v.toFixed(2))),
          },
        };
      } catch (err) {
        results[symbol] = { symbol, error: err.message };
      }
    }));

    return res.status(200).json({ data: results, updatedAt: new Date().toISOString() });

  } catch (err) {
    console.error('[api/market] Erro:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}