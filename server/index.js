require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const logsFile = path.join(dataDir, 'logs.json');
const favoritesFile = path.join(dataDir, 'favorites.json');

const assetCatalog = {
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'USD/SEK'],
  commodities: ['Gold', 'Silver', 'Crude Oil', 'Natural Gas', 'Copper'],
  indices: ['S&P 500', 'NASDAQ 100', 'DOW JONES', 'NIKKEI 225', 'DAX 40']
};

const baseRates = {
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2750,
  'USD/JPY': 149.5,
  'AUD/USD': 0.6750,
  'USD/CAD': 1.3650,
  'USD/CHF': 0.8850,
  'NZD/USD': 0.6200,
  'USD/SEK': 11.20,
  Gold: 1945.5,
  Silver: 24.8,
  'Crude Oil': 82.4,
  'Natural Gas': 2.81,
  Copper: 3.92,
  'S&P 500': 5250,
  'NASDAQ 100': 16810,
  'DOW JONES': 42050,
  'NIKKEI 225': 38840,
  'DAX 40': 16900
};

const timeframeMapping = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': 1440,
  '1w': 10080,
  '1M': 43200,
  '1y': 525600
};

const signalsTemplates = {
  bullish: ['Momentum strengthening', 'Price breakout confirmed', 'Support held', 'Trend continuation signal'],
  bearish: ['Bearish reversal identified', 'Resistance rejection', 'Momentum weakening', 'Pullback to resistance']
};

const twelveData = require('./providers/twelvedata');

const academyModules = [
  { title: 'FX Basics', description: 'Learn the fundamentals of currency pairs, pips, and leverage.' },
  { title: 'Technical Indicators', description: 'Understand moving averages, RSI, MACD, and chart patterns.' },
  { title: 'Risk Management', description: 'Develop position sizing, stop management, and portfolio protection.' },
  { title: 'Live Trade Execution', description: 'Follow real-case trade decisions and market entries step by step.' }
];

const indicatorsCatalog = ['SMA', 'EMA', 'RSI', 'MACD', 'Bollinger Bands', 'ADX', 'Stochastic'];
const riskToolsCatalog = ['Stop loss guidelines', 'Risk/reward calculator', 'Volatility monitor', 'Exposure management'];

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(logsFile)) {
    fs.writeFileSync(logsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(favoritesFile)) {
    fs.writeFileSync(favoritesFile, JSON.stringify([], null, 2));
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function randomWalkSeries(base, points) {
  const series = [];
  let current = base;
  for (let i = 0; i < points; i += 1) {
    const volatility = base * 0.0025;
    const change = (Math.random() - 0.5) * volatility;
    const next = Math.max(current + change, base * 0.85);
    const high = Math.max(current, next) + Math.abs(change) * Math.random();
    const low = Math.min(current, next) - Math.abs(change) * Math.random();
    series.push({ open: Number(current.toFixed(5)), high: Number(high.toFixed(5)), low: Number(low.toFixed(5)), close: Number(next.toFixed(5)), volume: Math.floor(Math.random() * 2200) + 600 });
    current = next;
  }
  return series;
}

function createCandles(symbol, timeframe) {
  const minutes = timeframeMapping[timeframe] || timeframeMapping['1m'];
  const base = baseRates[symbol] || 1;
  const points = Math.min(Math.max(Math.round(520 / Math.log2(minutes + 2)), 30), 120);
  const raw = randomWalkSeries(base, points);
  const now = Date.now();

  return raw.map((item, index) => ({
    time: new Date(now - (points - index) * 60000 * minutes).toISOString(),
    ...item
  }));
}

function calculateIndicators(candles, indicatorNames) {
  const closePrices = candles.map((c) => c.close);
  const sma = closePrices.slice(-14).reduce((sum, value) => sum + value, 0) / Math.max(closePrices.slice(-14).length, 1);
  const ema = closePrices.slice(-14).reduce((sum, value, idx, arr) => sum + value * (idx + 1), 0) / Math.max((14 * 15) / 2, 1);
  const rsi = 50 + (Math.random() - 0.5) * 20;
  const macd = Number((Math.random() * 1.6 - 0.8).toFixed(3));

  return {
    SMA: Number(sma.toFixed(4)),
    EMA: Number(ema.toFixed(4)),
    RSI: Number(rsi.toFixed(1)),
    MACD: macd,
    'Bollinger Bands': {
      upper: Number((sma * 1.02).toFixed(4)),
      lower: Number((sma * 0.98).toFixed(4))
    }
  };
}

function generateSignal(symbol, category) {
  const trend = Math.random() > 0.45 ? 'Buy' : 'Sell';
  const confidence = Math.floor(65 + Math.random() * 30);
  const rationale = trend === 'Buy' ? signalsTemplates.bullish[Math.floor(Math.random() * signalsTemplates.bullish.length)] : signalsTemplates.bearish[Math.floor(Math.random() * signalsTemplates.bearish.length)];

  return {
    symbol,
    category,
    signal: trend,
    confidence: `${confidence}%`,
    rationale,
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'][Math.floor(Math.random() * 6)]
  };
}

function createAssistantReply(query) {
  const cleaned = String(query || '').toLowerCase();
  if (cleaned.includes('risk')) {
    return 'Use a strict 1.5% risk cap per trade, keep stop loss below the nearest structural level, and avoid overexposure to one asset class.';
  }
  if (cleaned.includes('entry')) {
    return 'Wait for price confirmation above the short-term moving average and verify a bullish signal from RSI before entering the trade.';
  }
  return 'Focus on capital preservation first: confirm liquidity, set defined stops, and only scale positions after the signal confirms on multiple timeframes.';
}

ensureDataFiles();

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', name: 'PipVision FX Backend' });
});

function getTradingSessions() {
  // Approximate UTC windows for the four main sessions
  const sessions = [
    {
      name: 'Sydney',
      startUTC: 22,
      endUTC: 7,
      flag: '🇦🇺',
      timezone: '+10',
      localWindow: '09:00–16:00 AEST'
    },
    {
      name: 'Tokyo',
      startUTC: 0,
      endUTC: 9,
      flag: '🇯🇵',
      timezone: '+9',
      localWindow: '09:00–18:00 JST'
    },
    {
      name: 'London',
      startUTC: 8,
      endUTC: 17,
      flag: '🇬🇧',
      timezone: '+1',
      localWindow: '09:00–18:00 BST/GMT'
    },
    {
      name: 'New York',
      startUTC: 13,
      endUTC: 22,
      flag: '🇺🇸',
      timezone: '-4',
      localWindow: '08:00–17:00 ET'
    }
  ];

  const now = new Date();
  const utcHour = now.getUTCHours();

  return sessions.map((s) => {
    const { startUTC, endUTC } = s;
    let active = false;
    if (startUTC < endUTC) {
      active = utcHour >= startUTC && utcHour < endUTC;
    } else {
      // overnight session (e.g., Sydney)
      active = utcHour >= startUTC || utcHour < endUTC;
    }
    const pad = (value) => String(value).padStart(2, '0');
    const windowUTC = `${pad(startUTC)}:00–${pad(endUTC)}:00 UTC`;
    return { ...s, active, windowUTC };
  });
}

app.get('/api/overview', (req, res) => {
  const sessions = getTradingSessions();
  const activeSessions = sessions.filter((s) => s.active).map((s) => s.name);
  res.json({
    categories: assetCatalog,
    activeAsset: 'EUR/USD',
    marketSummary: {
      volatility: 'Moderate',
      session: activeSessions.length ? activeSessions.join(' / ') : 'No active session',
      monitor: '24/7 online tracking enabled',
      sessions,
      guidance: activeSessions.length
        ? `Currently active session: ${activeSessions.join(' and ')}.`
        : 'No main session is currently active. Trade with caution and refer to session windows.'
    }
  });
});

app.get('/api/market', (req, res) => {
  const category = req.query.category || 'forex';
  const symbol = req.query.symbol || assetCatalog[category]?.[0] || 'EUR/USD';
  const timeframe = req.query.timeframe || '1m';
  const requestedIndicators = String(req.query.indicators || '').split(',').map((name) => name.trim()).filter(Boolean);

  const candles = createCandles(symbol, timeframe);
  const indicatorValues = calculateIndicators(candles, requestedIndicators);
  const latest = candles[candles.length - 1] || { close: baseRates[symbol] || 1 };
  const currentChange = Number(((latest.close - (baseRates[symbol] || 1)) / (baseRates[symbol] || 1) * 100).toFixed(2));

  res.json({
    symbol,
    category,
    timeframe,
    lastUpdated: new Date().toISOString(),
    overview: {
      price: Number(latest.close.toFixed(5)),
      change: currentChange,
      high: Number(Math.max(...candles.map((c) => c.high)).toFixed(5)),
      low: Number(Math.min(...candles.map((c) => c.low)).toFixed(5)),
      volume: candles.reduce((sum, c) => sum + c.volume, 0)
    },
    candles,
    indicators: indicatorValues,
    availableIndicators: indicatorsCatalog
  });
});

app.get('/api/signals', (req, res) => {
  const category = req.query.category || 'forex';
  const symbols = assetCatalog[category] || ['EUR/USD'];
  const items = symbols.slice(0, 4).map((symbol) => generateSignal(symbol, category));
  res.json({ category, signals: items });
});

app.get('/api/favorites', (req, res) => {
  res.json(readJson(favoritesFile));
});

app.post('/api/favorites', (req, res) => {
  const favorites = readJson(favoritesFile);
  const symbol = String(req.body.symbol || '').trim();
  if (!symbol) {
    return res.status(400).json({ message: 'Symbol is required' });
  }
  if (!favorites.includes(symbol)) {
    favorites.unshift(symbol);
    writeJson(favoritesFile, favorites.slice(0, 12));
  }
  res.json(favorites);
});

app.delete('/api/favorites/:symbol', (req, res) => {
  const symbol = String(req.params.symbol || '').trim();
  const favorites = readJson(favoritesFile).filter((item) => item !== symbol);
  writeJson(favoritesFile, favorites);
  res.json(favorites);
});

app.get('/api/logs', (req, res) => {
  const logs = readJson(logsFile);
  res.json(logs.slice(-20).reverse());
});

app.post('/api/logs', (req, res) => {
  const logs = readJson(logsFile);
  const entry = {
    timestamp: new Date().toISOString(),
    action: req.body.action || 'user event',
    details: req.body.details || ''
  };
  logs.push(entry);
  writeJson(logsFile, logs);
  res.json(entry);
});

app.get('/api/academy', (req, res) => {
  const aiBook = {
    title: 'PipVision FX — AI Trading Guide',
    description: 'An AI-curated book that teaches strategy, risk, and live trade workflows with examples and checkpoints.',
    chapters: [
      {
        id: 1,
        title: 'Foundations of FX Trading',
        content: 'Understand pairs, pips, lot sizes, leverage, and the mechanics of spot FX markets. Focus on liquidity, session overlaps, and order types.'
      },
      {
        id: 2,
        title: 'Technical Toolkit',
        content: 'Learn indicators (SMA, EMA, RSI, MACD), chart patterns, support/resistance, and multi-timeframe validation.'
      },
      {
        id: 3,
        title: 'Risk & Money Management',
        content: 'Position sizing, stop placement, risk per trade, diversification across assets, and volatility-adjusted sizing.'
      },
      {
        id: 4,
        title: 'AI-Assisted Signal Workflows',
        content: 'How to combine AI signals with rule-based filters: confirmation across trend, volume, and momentum indicators.'
      },
      {
        id: 5,
        title: 'Live Examples and Case Studies',
        content: 'Step-by-step annotated trades showing entries, stops, targets, and post-trade review for continuous improvement.'
      }
    ]
  };

  res.json({ modules: academyModules, aiBook });
});

app.get('/api/indicators', (req, res) => {
  res.json({ available: indicatorsCatalog });
});

// Provider: Twelve Data market fetch (uses TWELVEDATA_KEY if provided, otherwise simulated)
app.get('/api/provider/twelvedata/market', async (req, res) => {
  const symbol = req.query.symbol || 'EUR/USD';
  const interval = req.query.interval || req.query.timeframe || '1min';
  try {
    const result = await twelveData.getMarket({ apiKey: process.env.TWELVEDATA_KEY, symbol, interval });
    if (result.error) return res.status(502).json({ error: result.error });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

app.get('/api/risk-tools', (req, res) => {
  res.json({ tools: riskToolsCatalog });
});

app.post('/api/assistant', (req, res) => {
  const query = String(req.body.query || '');
  res.json({ answer: createAssistantReply(query) });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PipVision FX backend running on http://localhost:${PORT}`);
});
