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
  bearish: ['Bearish reversal identified', 'Resistance rejection', 'Momentum weakening', 'Pullback to resistance'],
  metalBullish: ['Safe-haven demand intensifies', 'Precious metal breakout above resistance', 'Central bank buying drives price higher', 'Inflation hedge rally continues'],
  metalBearish: ['Profit-taking pressures metal lower', 'Risk-on sentiment weighs on gold', 'Dollar strength pressures precious metals', 'Technical rejection from key level']
};

const twelveData = require('./providers/twelvedata');

const academyModules = [
  {
    title: 'FX Basics',
    description: 'Learn currency pairs, pips, spreads, lot sizes, leverage, margin, sessions, order types, and how news moves exchange rates.',
    lessons: [
      'Currency pairs quote one currency against another. In EUR/USD, EUR is the base currency and USD is the quote currency.',
      'A pip is the common measuring unit for price movement. Most major pairs use 0.0001 as one pip, while JPY pairs usually use 0.01.',
      'The spread is the difference between bid and ask. It is a trading cost, so avoid low-liquidity periods when spreads widen.',
      'Lot size controls exposure. Standard lots are 100,000 units, mini lots are 10,000, and micro lots are 1,000.',
      'Leverage increases buying power, but it also magnifies losses. Professional traders size positions from risk first, not from available leverage.',
      'Margin is the capital locked to keep a position open. Free margin protects you from forced liquidation during volatility.',
      'The London and New York overlap often has the best liquidity for major pairs, while Asian sessions can be cleaner for JPY and AUD flows.',
      'Market orders prioritize execution, limit orders prioritize price, and stop orders can trigger entries or exits when a level breaks.',
      'Major FX drivers include interest-rate expectations, inflation, jobs data, central-bank speeches, risk sentiment, and commodity prices.',
      'Before every trade, define bias, entry trigger, stop loss, target, position size, and the reason you will not take the setup.'
    ]
  },
  { title: 'Technical Indicators', description: 'Understand moving averages, RSI, MACD, and chart patterns.' },
  { title: 'Risk Management', description: 'Develop position sizing, stop management, and portfolio protection.' },
  { title: 'Live Trade Execution', description: 'Follow real-case trade decisions and market entries step by step.' }
];

const recommendedBooks = [
  {
    title: 'Currency Trading for Dummies',
    author: 'Brian Dolan and Kathleen Brooks',
    level: 'Beginner',
    why: 'A friendly starting point for FX mechanics, pair behavior, market sessions, orders, and macro drivers.'
  },
  {
    title: 'A Beginner\'s Guide to Forex Trading',
    author: 'Matthew Driver',
    level: 'Beginner',
    why: 'Good for building a basic routine around analysis, trade preparation, and common beginner mistakes.'
  },
  {
    title: 'Japanese Candlestick Charting Techniques',
    author: 'Steve Nison',
    level: 'Beginner to intermediate',
    why: 'Useful for reading candle structure, reversals, continuation patterns, and price action around key levels.'
  },
  {
    title: 'Technical Analysis of the Financial Markets',
    author: 'John J. Murphy',
    level: 'Intermediate',
    why: 'A broad reference for trend, support and resistance, indicators, chart patterns, and market psychology.'
  },
  {
    title: 'Trading in the Zone',
    author: 'Mark Douglas',
    level: 'All levels',
    why: 'One of the best books for discipline, probabilities, emotional control, and executing a plan without hesitation.'
  },
  {
    title: 'Market Wizards',
    author: 'Jack D. Schwager',
    level: 'All levels',
    why: 'Interviews with successful traders that show different styles, risk habits, and the mindset behind longevity.'
  },
  {
    title: 'The New Trading for a Living',
    author: 'Dr. Alexander Elder',
    level: 'Intermediate',
    why: 'Connects psychology, technical analysis, risk management, and journaling into a practical trading process.'
  },
  {
    title: 'Day Trading and Swing Trading the Currency Market',
    author: 'Kathy Lien',
    level: 'Intermediate',
    why: 'Focused specifically on currencies, macro catalysts, pair selection, and practical FX trading strategies.'
  }
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
  const isMetal = symbol.includes('Gold') || symbol.includes('XAU') || symbol.includes('Silver') || symbol.includes('XAG');
  const trend = Math.random() > 0.45 ? 'Buy' : 'Sell';
  const confidence = Math.floor(65 + Math.random() * 30);
  const templates = isMetal
    ? (trend === 'Buy' ? signalsTemplates.metalBullish : signalsTemplates.metalBearish)
    : (trend === 'Buy' ? signalsTemplates.bullish : signalsTemplates.bearish);
  const rationale = templates[Math.floor(Math.random() * templates.length)];

  return {
    symbol,
    category,
    signal: trend,
    confidence: `${confidence}%`,
    rationale,
    timeframe: ['1m', '5m', '15m', '1h', '4h', '1d'][Math.floor(Math.random() * 6)]
  };
}

function normalizeSymbol(value) {
  const candidate = String(value || '').trim();
  const allSymbols = Object.values(assetCatalog).flat();
  return allSymbols.find((symbol) => symbol.toLowerCase() === candidate.toLowerCase()) || candidate || 'EUR/USD';
}

function splitAssistantQueries(query) {
  const normalized = String(query || '')
    .replace(/\r/g, '\n')
    .split(/\n+|(?<=\?)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length ? normalized.slice(0, 6) : [];
}

function getMarketBias(context = {}) {
  const indicators = context.indicators || {};
  const overview = context.overview || {};
  const rsi = Number(indicators.RSI);
  const macd = Number(indicators.MACD);
  const price = Number(overview.price);
  const sma = Number(indicators.SMA);
  const ema = Number(indicators.EMA);

  let score = 0;
  const reasons = [];

  if (Number.isFinite(rsi)) {
    if (rsi >= 70) {
      score -= 1;
      reasons.push(`RSI is elevated at ${rsi.toFixed(1)}, so chase entries need confirmation.`);
    } else if (rsi <= 30) {
      score += 1;
      reasons.push(`RSI is compressed at ${rsi.toFixed(1)}, which can support a rebound setup.`);
    } else {
      reasons.push(`RSI is neutral at ${rsi.toFixed(1)}, so trend and structure matter more.`);
    }
  }

  if (Number.isFinite(macd)) {
    score += macd >= 0 ? 1 : -1;
    reasons.push(`MACD is ${macd >= 0 ? 'positive' : 'negative'} (${macd.toFixed(3)}).`);
  }

  if (Number.isFinite(price) && Number.isFinite(sma)) {
    score += price >= sma ? 1 : -1;
    reasons.push(`Price is ${price >= sma ? 'above' : 'below'} the SMA.`);
  }

  if (Number.isFinite(price) && Number.isFinite(ema)) {
    score += price >= ema ? 1 : -1;
    reasons.push(`Price is ${price >= ema ? 'above' : 'below'} the EMA.`);
  }

  const bias = score >= 2 ? 'bullish' : score <= -2 ? 'bearish' : 'mixed';
  return { bias, reasons: reasons.slice(0, 3) };
}

function createAssistantReply(query, context = {}) {
  const questions = splitAssistantQueries(query);
  if (!questions.length) {
    return {
      answer: 'Please enter a trading question, setup, or risk scenario for the assistant to review.',
      items: []
    };
  }

  const symbol = normalizeSymbol(context.symbol);
  const timeframe = context.timeframe || 'current timeframe';
  const { bias, reasons } = getMarketBias(context);

  const items = questions.map((question, index) => {
    const cleaned = question.toLowerCase();
    const wantsRisk = /\brisk|stop|loss|size|position|drawdown|leverage/.test(cleaned);
    const wantsEntry = /\bentry|enter|buy|sell|long|short|setup|signal/.test(cleaned);
    const wantsNews = /\bnews|fundamental|event|cpi|nfp|fed|ecb|boj|rate/.test(cleaned);
    const wantsExit = /\bexit|target|take profit|tp|close|trail/.test(cleaned);

    const lines = [`${index + 1}. ${question}`];
    lines.push(`Market read: ${symbol} on ${timeframe} has a ${bias} technical bias.`);

    if (reasons.length) {
      lines.push(`Evidence: ${reasons.join(' ')}`);
    } else {
      lines.push('Evidence: live indicators were not supplied, so treat this as a process checklist rather than a signal.');
    }

    if (wantsRisk) {
      lines.push('Risk plan: cap risk at 0.5%-1.5% per trade, place the stop beyond invalidation, and avoid adding if the stop distance forces oversized exposure.');
    }

    if (wantsEntry) {
      lines.push('Entry plan: wait for price acceptance at the level, confirm momentum on the next candle, and only execute when reward-to-risk is at least 2:1.');
    }

    if (wantsExit) {
      lines.push('Exit plan: scale partial profit at the first liquidity area, move risk to breakeven only after structure confirms, and trail behind fresh swing points.');
    }

    if (wantsNews) {
      lines.push('Fundamental check: avoid opening new size immediately before high-impact releases; let spreads normalize and reassess after the first reaction candle.');
    }

    if (!wantsRisk && !wantsEntry && !wantsNews && !wantsExit) {
      lines.push('Professional checklist: define bias, invalidation, entry trigger, position size, target, and the reason you would stand aside before placing the trade.');
    }

    lines.push('Decision: this is trade-planning guidance, not financial advice; confirm with your own chart and risk rules before execution.');
    return lines.join('\n');
  });

  return {
    answer: items.join('\n\n'),
    items,
    meta: {
      symbol,
      timeframe,
      bias,
      handledQueries: items.length
    }
  };
}

ensureDataFiles();

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', name: 'PipVision FX Backend' });
});

function getTradingSessions() {
  const sessions = [
    { name: 'Sydney', startUTC: 22, endUTC: 7, flag: '🇦🇺', timezone: '+10', localWindow: '09:00–16:00 AEST' },
    { name: 'Tokyo', startUTC: 0, endUTC: 9, flag: '🇯🇵', timezone: '+9', localWindow: '09:00–18:00 JST' },
    { name: 'London', startUTC: 8, endUTC: 17, flag: '🇬🇧', timezone: '+1', localWindow: '09:00–18:00 BST/GMT' },
    { name: 'New York', startUTC: 13, endUTC: 22, flag: '🇺🇸', timezone: '-4', localWindow: '08:00–17:00 ET' }
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
        content: 'Understand pairs, pips, lot sizes, leverage, margin, spreads, swaps, and the mechanics of spot FX markets. Focus on liquidity, session overlaps, order types, and the difference between analysis and execution.'
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

  res.json({ modules: academyModules, aiBook, recommendedBooks });
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
  const context = req.body.context && typeof req.body.context === 'object' ? req.body.context : {};
  res.json(createAssistantReply(query, context));
});

app.get('/api/news', (req, res) => {
  const category = req.query.category || 'forex';
  const symbol = req.query.symbol || 'EUR/USD';
  const hourAgo = (hours) => new Date(Date.now() - hours * 3600000).toISOString();
  const includesAny = (value, terms) => terms.some((term) => value.includes(term));
  const selected = String(symbol);

  const goldNews = [
    { title: 'Gold Holds Bid as Real Yields Ease', summary: 'Bullion remains supported as softer real yields improve demand for non-yielding assets. Traders are watching whether buyers defend the latest breakout zone.', time: hourAgo(0), impact: 'high', source: 'Kitco News', currency: 'XAU' },
    { title: 'Central Banks Continue Gold Accumulation', summary: 'Reserve managers keep adding bullion as diversification remains a priority, giving gold a steady structural demand backdrop.', time: hourAgo(1), impact: 'high', source: 'Reuters', currency: 'XAU' },
    { title: 'Gold Volatility Expands Before US Data', summary: 'Options pricing points to wider two-way risk ahead of inflation and labor-market releases. Intraday traders should expect sharper stop hunts.', time: hourAgo(2), impact: 'medium', source: 'Bloomberg', currency: 'XAU' },
    { title: 'Dollar Pullback Supports Precious Metals', summary: 'A softer dollar is helping gold and silver recover, although buyers still need confirmation above nearby resistance.', time: hourAgo(3), impact: 'medium', source: 'MarketWatch', currency: 'USD' },
    { title: 'Gold Miners Track Bullion Higher', summary: 'Mining shares outperform as margins improve with firmer spot prices. Equity flows are adding a supportive signal for metals sentiment.', time: hourAgo(4), impact: 'low', source: 'Mining.com', currency: 'XAU' },
    { title: 'Asia Session Demand Keeps Gold Firm', summary: 'Physical demand from Asian trading desks remains steady, limiting downside during quieter liquidity windows.', time: hourAgo(5), impact: 'low', source: 'FXStreet', currency: 'XAU' },
    { title: 'Safe-Haven Flows Return on Geopolitical Risk', summary: 'Fresh risk headlines are drawing defensive bids into precious metals while equity futures trade cautiously.', time: hourAgo(6), impact: 'high', source: 'CNBC', currency: 'XAU' },
    { title: 'Silver Follows Gold but Lags Momentum', summary: 'Silver is rising with gold, but weaker industrial demand expectations keep relative performance uneven.', time: hourAgo(7), impact: 'medium', source: 'Investing.com', currency: 'XAG' }
  ];

  const commoditiesNews = [
    { title: `${selected} Traders Watch Inventory Data`, summary: 'Commodity desks are focusing on inventory changes and demand revisions. Breakouts may need confirmation from volume and session close levels.', time: hourAgo(0), impact: 'high', source: 'Reuters', currency: selected },
    { title: 'Crude Oil Holds Range Before OPEC Commentary', summary: 'Energy markets remain range-bound as traders balance supply guidance against demand uncertainty from major economies.', time: hourAgo(1), impact: 'medium', source: 'Bloomberg', currency: 'Oil' },
    { title: 'Natural Gas Slides on Weather Revisions', summary: 'Forecast models point to milder demand conditions, pressuring near-term gas contracts and increasing volatility around storage reports.', time: hourAgo(2), impact: 'medium', source: 'MarketWatch', currency: 'Gas' },
    { title: 'Copper Finds Support on China Stimulus Hopes', summary: 'Base metals are firmer as traders price the possibility of stronger industrial demand and infrastructure support.', time: hourAgo(3), impact: 'medium', source: 'Fastmarkets', currency: 'Copper' },
    { title: 'Commodities Desk Flags Stronger Dollar Risk', summary: 'A dollar rebound could pressure metals and energy contracts, especially if US yields move higher during New York trading.', time: hourAgo(4), impact: 'high', source: 'FXStreet', currency: 'USD' },
    { title: 'Shipping Costs Add Noise to Raw Material Prices', summary: 'Freight volatility is affecting some commodity spreads, making regional pricing less predictable for short-term traders.', time: hourAgo(5), impact: 'low', source: 'S&P Global', currency: 'Commodities' }
  ];

  const forexNews = [
    { title: `${selected} Consolidates Ahead of US Session`, summary: 'Liquidity is improving into the New York handover. Traders are watching whether the pair can hold its intraday structure after the next data impulse.', time: hourAgo(0), impact: 'medium', source: 'Forex Factory', currency: selected },
    { title: 'Dollar Index Holds Steady Before Inflation Data', summary: 'Major pairs are consolidating as markets wait for a fresh inflation signal. Fed pricing remains the key driver for USD volatility.', time: hourAgo(1), impact: 'high', source: 'MarketWatch', currency: 'USD' },
    { title: 'ECB Speakers Keep Euro Traders Cautious', summary: 'Policy comments continue to stress data dependence, leaving EUR pairs sensitive to yield-spread moves.', time: hourAgo(2), impact: 'medium', source: 'Reuters', currency: 'EUR' },
    { title: 'BoJ Watch Keeps Yen Crosses Volatile', summary: 'Japanese officials continue to monitor currency weakness, raising the risk of sharp reversals in JPY pairs.', time: hourAgo(3), impact: 'high', source: 'Bloomberg', currency: 'JPY' },
    { title: 'Sterling Tracks UK Yield Expectations', summary: 'GBP pairs are following front-end yield changes as traders reassess growth and inflation expectations.', time: hourAgo(4), impact: 'medium', source: 'DailyFX', currency: 'GBP' },
    { title: 'Commodity FX Firms With Risk Sentiment', summary: 'AUD, CAD, and NZD are stabilizing as equity sentiment improves and commodity-linked flows recover.', time: hourAgo(5), impact: 'low', source: 'FXStreet', currency: 'AUD/CAD/NZD' },
    { title: 'Session Overlap May Lift Forex Volatility', summary: 'London-New York overlap is expected to bring tighter spreads but faster momentum swings around key levels.', time: hourAgo(6), impact: 'medium', source: 'Investing.com', currency: 'FX' },
    { title: 'Treasury Yields Guide Dollar Direction', summary: 'USD bulls need yields to extend higher; a yield fade could open room for relief rallies across major pairs.', time: hourAgo(7), impact: 'high', source: 'CNBC', currency: 'USD' },
    { title: 'Swiss Franc Demand Softens as Risk Appetite Improves', summary: 'CHF is losing some defensive bid as broader risk conditions stabilize across European trading.', time: hourAgo(8), impact: 'low', source: 'Reuters', currency: 'CHF' },
    { title: 'Scandinavian FX Watches Energy Prices', summary: 'NOK and SEK remain sensitive to energy flows, regional growth data, and broader dollar direction.', time: hourAgo(9), impact: 'low', source: 'Bloomberg', currency: 'SEK/NOK' }
  ];

  const indicesNews = [
    { title: `${selected} Futures Trade Carefully Before US Cash Open`, summary: 'Index futures are holding a narrow range as traders wait for cash-market breadth and volume confirmation.', time: hourAgo(0), impact: 'medium', source: 'MarketWatch', currency: selected },
    { title: 'Tech Megacaps Drive NASDAQ Sentiment', summary: 'Large-cap technology names continue to steer risk appetite, keeping NASDAQ volatility elevated around earnings and guidance headlines.', time: hourAgo(1), impact: 'high', source: 'CNBC', currency: 'NASDAQ' },
    { title: 'S&P 500 Breadth Improves but Resistance Holds', summary: 'More sectors are participating in the move, but the index still needs a clean close above resistance to confirm continuation.', time: hourAgo(2), impact: 'medium', source: 'Bloomberg', currency: 'SPX' },
    { title: 'Dow Industrials Supported by Defensive Rotation', summary: 'Value and defensive sectors are attracting flows as traders balance growth optimism against policy uncertainty.', time: hourAgo(3), impact: 'low', source: 'Reuters', currency: 'DJIA' },
    { title: 'Europe Indices Track Rate-Cut Expectations', summary: 'DAX and broader European benchmarks are sensitive to central-bank repricing and euro-area data surprises.', time: hourAgo(4), impact: 'medium', source: 'Financial Times', currency: 'DAX' },
    { title: 'Nikkei Watches Yen and Exporter Flows', summary: 'Japanese equities remain tied to currency moves, with exporter strength depending on whether yen weakness persists.', time: hourAgo(5), impact: 'medium', source: 'Nikkei Asia', currency: 'JPY' },
    { title: 'Volatility Gauge Edges Higher', summary: 'Option hedging is increasing into upcoming macro releases, which could make index breakouts less reliable until data clears.', time: hourAgo(6), impact: 'high', source: 'CBOE', currency: 'VIX' },
    { title: 'Small Caps Lag as Funding Costs Stay Elevated', summary: 'Higher borrowing costs continue to weigh on smaller companies, keeping market leadership concentrated.', time: hourAgo(7), impact: 'low', source: 'Barrons', currency: 'US Equities' }
  ];

  let items = forexNews;
  if (includesAny(selected, ['Gold', 'XAU'])) {
    items = goldNews;
  } else if (category === 'commodities') {
    items = commoditiesNews;
  } else if (category === 'indices') {
    items = indicesNews;
  }

  res.json({ news: items, count: items.length, generatedAt: new Date().toISOString() });
});

const clientDistDir = path.join(__dirname, '..', 'dist');
const clientIndexFile = path.join(clientDistDir, 'index.html');

if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));
}

app.get('/', (req, res) => {
  if (fs.existsSync(clientIndexFile)) {
    return res.sendFile(clientIndexFile);
  }

  return res.json({
    message: 'PipVision FX API is running. Open the Vite frontend on http://localhost:5173, or build the app to serve it from this backend.',
    api: '/api/status'
  });
});

app.get(/^\/(?!api\/).*/, (req, res) => {
  if (fs.existsSync(clientIndexFile)) {
    return res.sendFile(clientIndexFile);
  }

  return res.status(404).json({
    message: `No frontend build is available for ${req.path}. Run npm run dev for the app, or npm run build before serving from the backend.`,
    api: '/api/status'
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`PipVision FX backend running on http://localhost:${PORT}`);
});
