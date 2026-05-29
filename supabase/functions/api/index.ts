import { serve } from "https://deno.land/x/sift@0.6.0/mod.ts";

const assetCatalog = {
  forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "USD/CHF", "NZD/USD", "USD/SEK"],
  commodities: ["Gold", "Silver", "Crude Oil", "Natural Gas", "Copper"],
  indices: ["S&P 500", "NASDAQ 100", "DOW JONES", "NIKKEI 225", "DAX 40"]
};

const baseRates = {
  "EUR/USD": 1.0850,
  "GBP/USD": 1.2750,
  "USD/JPY": 149.5,
  Gold: 1945.5,
  Silver: 24.8,
  "Crude Oil": 82.4,
  "Natural Gas": 2.81,
  Copper: 3.92,
  "S&P 500": 5250,
  "NASDAQ 100": 16810,
  "DOW JONES": 42050,
  "NIKKEI 225": 38840,
  "DAX 40": 16900
};

const timeframeMapping = {
  "1m": 1, "5m": 5, "15m": 15, "1h": 60,
  "4h": 240, "1d": 1440, "1w": 10080, "1M": 43200, "1y": 525600
};

const signalsTemplates = {
  bullish: ["Momentum strengthening", "Price breakout confirmed", "Support held", "Trend continuation signal"],
  bearish: ["Bearish reversal identified", "Resistance rejection", "Momentum weakening", "Pullback to resistance"]
};

const academyModules = [
  { title: "FX Basics", description: "Learn the fundamentals of currency pairs, pips, and leverage." },
  { title: "Technical Indicators", description: "Understand moving averages, RSI, MACD, and chart patterns." },
  { title: "Risk Management", description: "Develop position sizing, stop management, and portfolio protection." },
  { title: "Live Trade Execution", description: "Follow real-case trade decisions and market entries step by step." }
];

const indicatorsCatalog = ["SMA", "EMA", "RSI", "MACD", "Bollinger Bands", "ADX", "Stochastic"];
const riskToolsCatalog = ["Stop loss guidelines", "Risk/reward calculator", "Volatility monitor", "Exposure management"];

function randomWalkSeries(base, points) {
  const series = [];
  let current = base;
  for (let i = 0; i < points; i++) {
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
  const minutes = timeframeMapping[timeframe] || timeframeMapping["1m"];
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
    "Bollinger Bands": { upper: Number((sma * 1.02).toFixed(4)), lower: Number((sma * 0.98).toFixed(4)) }
  };
}

function generateSignal(symbol, category) {
  const trend = Math.random() > 0.45 ? "Buy" : "Sell";
  const confidence = Math.floor(65 + Math.random() * 30);
  const rationale = trend === "Buy" ? signalsTemplates.bullish[Math.floor(Math.random() * signalsTemplates.bullish.length)] : signalsTemplates.bearish[Math.floor(Math.random() * signalsTemplates.bearish.length)];
  return { symbol, category, signal: trend, confidence: `${confidence}%`, rationale, timeframe: ["1m", "5m", "15m", "1h", "4h", "1d"][Math.floor(Math.random() * 6)] };
}

const sessions = [
  { name: "Sydney", startUTC: 22, endUTC: 7, flag: "🇦🇺", timezone: "+10", localWindow: "09:00–16:00 AEST" },
  { name: "Tokyo", startUTC: 0, endUTC: 9, flag: "🇯🇵", timezone: "+9", localWindow: "09:00–18:00 JST" },
  { name: "London", startUTC: 8, endUTC: 17, flag: "🇬🇧", timezone: "+1", localWindow: "09:00–18:00 BST/GMT" },
  { name: "New York", startUTC: 13, endUTC: 22, flag: "🇺🇸", timezone: "-4", localWindow: "08:00–17:00 ET" }
];

function getTradingSessions() {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const pad = (value) => String(value).padStart(2, "0");

  return sessions.map((s) => {
    const { startUTC, endUTC } = s;
    let active = false;
    if (startUTC < endUTC) {
      active = utcHour >= startUTC && utcHour < endUTC;
    } else {
      active = utcHour >= startUTC || utcHour < endUTC;
    }
    const windowUTC = `${pad(startUTC)}:00–${pad(endUTC)}:00 UTC`;
    return { ...s, active, windowUTC };
  });
}

serve({
  "/status": () => new Response(JSON.stringify({ status: "ok", version: "1.0.0", name: "PipVision FX Backend" }), { headers: { "Content-Type": "application/json" } }),

  "/overview": () => {
    const sess = getTradingSessions();
    const activeSessions = sess.filter((s) => s.active).map((s) => s.name);
    return new Response(JSON.stringify({
      categories: assetCatalog,
      activeAsset: "EUR/USD",
      marketSummary: {
        volatility: "Moderate",
        session: activeSessions.length ? activeSessions.join(" / ") : "No active session",
        monitor: "24/7 online tracking enabled",
        sessions: sess,
        guidance: activeSessions.length ? `Currently active session: ${activeSessions.join(" and ")}.` : "No main session is currently active. Trade with caution and refer to session windows."
      }
    }), { headers: { "Content-Type": "application/json" } });
  },

  "/market": (req) => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "forex";
    const symbol = url.searchParams.get("symbol") || assetCatalog[category]?.[0] || "EUR/USD";
    const timeframe = url.searchParams.get("timeframe") || "1m";
    const candles = createCandles(symbol, timeframe);
    const indicatorValues = calculateIndicators(candles);
    const latest = candles[candles.length - 1] || { close: baseRates[symbol] || 1 };
    const currentChange = Number(((latest.close - (baseRates[symbol] || 1)) / (baseRates[symbol] || 1) * 100).toFixed(2));
    return new Response(JSON.stringify({
      symbol, category, timeframe, lastUpdated: new Date().toISOString(),
      overview: { price: Number(latest.close.toFixed(5)), change: currentChange, high: Number(Math.max(...candles.map((c) => c.high)).toFixed(5)), low: Number(Math.min(...candles.map((c) => c.low)).toFixed(5)), volume: candles.reduce((sum, c) => sum + c.volume, 0) },
      candles, indicators: indicatorValues
    }), { headers: { "Content-Type": "application/json" } });
  },

  "/signals": (req) => {
    const url = new URL(req.url);
    const category = url.searchParams.get("category") || "forex";
    const symbols = assetCatalog[category] || ["EUR/USD"];
    const items = symbols.slice(0, 4).map((symbol) => generateSignal(symbol, category));
    return new Response(JSON.stringify({ category, signals: items }), { headers: { "Content-Type": "application/json" } });
  },

  "/indicators": () => new Response(JSON.stringify({ available: indicatorsCatalog }), { headers: { "Content-Type": "application/json" } }),

  "/risk-tools": () => new Response(JSON.stringify({ tools: riskToolsCatalog }), { headers: { "Content-Type": "application/json" } }),

  "/academy": () => {
    const aiBook = {
      title: "PipVision FX — AI Trading Guide",
      description: "An AI-curated book that teaches strategy, risk, and live trade workflows with examples and checkpoints.",
      chapters: [
        { id: 1, title: "Foundations of FX Trading", content: "Understand pairs, pips, lot sizes, leverage, and the mechanics of spot FX markets." },
        { id: 2, title: "Technical Toolkit", content: "Learn indicators (SMA, EMA, RSI, MACD), chart patterns, support/resistance." },
        { id: 3, title: "Risk & Money Management", content: "Position sizing, stop placement, risk per trade, diversification." },
        { id: 4, title: "AI-Assisted Signal Workflows", content: "How to combine AI signals with rule-based filters." },
        { id: 5, title: "Live Examples and Case Studies", content: "Step-by-step annotated trades showing entries and stops." }
      ]
    };
    return new Response(JSON.stringify({ modules: academyModules, aiBook }), { headers: { "Content-Type": "application/json" } });
  },

  "/assistant": async (req) => {
    const body = await req.json();
    const query = String(body.query || "").toLowerCase();
    let answer = "Focus on capital preservation first: confirm liquidity, set defined stops, and only scale positions after the signal confirms on multiple timeframes.";
    if (query.includes("risk")) answer = "Use a strict 1.5% risk cap per trade, keep stop loss below the nearest structural level.";
    else if (query.includes("entry")) answer = "Wait for price confirmation above the short-term moving average and verify a bullish signal from RSI.";
    return new Response(JSON.stringify({ answer }), { headers: { "Content-Type": "application/json" } });
  }
});