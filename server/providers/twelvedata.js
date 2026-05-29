const API_BASE = 'https://api.twelvedata.com';

function randomWalkSeries(base, points) {
  const series = [];
  let current = base;
  for (let i = 0; i < points; i += 1) {
    const volatility = Math.max(Math.abs(base) * 0.0015, 0.0001);
    const change = (Math.random() - 0.5) * volatility;
    const next = Math.max(current + change, base * 0.5);
    const high = Math.max(current, next) + Math.abs(change) * Math.random();
    const low = Math.min(current, next) - Math.abs(change) * Math.random();
    series.push({ open: Number(current.toFixed(5)), high: Number(high.toFixed(5)), low: Number(low.toFixed(5)), close: Number(next.toFixed(5)), volume: Math.floor(Math.random() * 2000) + 200 });
    current = next;
  }
  return series;
}

async function fetchFromTwelve(apiKey, symbol, interval, outputsize = 100) {
  const url = `${API_BASE}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}&outputsize=${outputsize}&format=JSON&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Twelve Data fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.status === 'error') throw new Error(json.message || 'Twelve Data error');
  const values = json.values || [];
  // values are in descending order (newest first)
  return values.map((v) => ({
    time: v.datetime || v.timestamp,
    open: Number(v.open),
    high: Number(v.high),
    low: Number(v.low),
    close: Number(v.close),
    volume: Number(v.volume || 0)
  })).reverse();
}

module.exports = {
  async getMarket({ apiKey, symbol = 'EUR/USD', interval = '1min' }) {
    try {
      if (apiKey) {
        const candles = await fetchFromTwelve(apiKey, symbol, interval, 200);
        return { provider: 'twelvedata', source: 'api', candles };
      }
      // fallback simulation
      const base = symbol === 'EUR/USD' ? 1.085 : 100;
      const candles = randomWalkSeries(base, 120).map((c, idx) => ({ time: new Date(Date.now() - (120 - idx) * 60000).toISOString(), ...c }));
      return { provider: 'twelvedata', source: 'simulation', candles };
    } catch (err) {
      return { error: err.message };
    }
  }
};
