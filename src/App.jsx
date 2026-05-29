import { useEffect, useMemo, useRef, useState } from 'react';

const assetCatalog = {
  forex: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'USD/SEK'],
  commodities: ['Gold', 'Silver', 'Crude Oil', 'Natural Gas', 'Copper'],
  indices: ['S&P 500', 'NASDAQ 100', 'DOW JONES', 'NIKKEI 225', 'DAX 40']
};

const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w', '1M', '1y'];
const defaultIndicators = ['SMA', 'EMA', 'RSI'];
const categories = ['forex', 'commodities', 'indices'];

function formatRate(rate) {
  return rate.toFixed(rate > 10 ? 2 : 4);
}

function buildApiPath(path) {
  const apiBase = import.meta.env.VITE_API_URL || '';
  return `${apiBase}/api${path}`;
}

function App() {
  const [category, setCategory] = useState('forex');
  const [assetList, setAssetList] = useState(assetCatalog.forex);
  const [selectedAsset, setSelectedAsset] = useState(assetCatalog.forex[0]);
  const [timeframe, setTimeframe] = useState('1m');
  const [selectedIndicators, setSelectedIndicators] = useState(defaultIndicators);
  const [marketData, setMarketData] = useState(null);
  const [dataSource, setDataSource] = useState('simulation');
  const [signals, setSignals] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [academy, setAcademy] = useState([]);
  const [aiBook, setAiBook] = useState(null);
  const [openChapter, setOpenChapter] = useState(null);
  const [riskTools, setRiskTools] = useState([]);
  const [indicatorOptions, setIndicatorOptions] = useState(defaultIndicators);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('Ask the trading assistant for risk, entries, or strategy validation.');
  const [accountSize, setAccountSize] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1); // percent per trade
  const [entryPrice, setEntryPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [calcResult, setCalcResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('Loading market engine and analytics modules...');
  const [overview, setOverview] = useState(null);
  const [localTime, setLocalTime] = useState(new Date());
  const chartRef = useRef(null);

  useEffect(() => {
    loadSetup();
  }, []);

  useEffect(() => {
    loadMarket();
    loadSignals();
  }, [category, selectedAsset, timeframe, selectedIndicators, dataSource]);

  useEffect(() => {
    drawCandlestick();
  }, [marketData]);

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const categoryDisplay = useMemo(
    () => ({ forex: 'Forex', commodities: 'Commodities', indices: 'Indices' })[category],
    [category]
  );

  const favoriteSummary = useMemo(() => {
    return favorites.slice(0, 4);
  }, [favorites]);

  async function pushLog(action, details) {
    try {
      await fetch(buildApiPath('/logs'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, details })
      });
    } catch (error) {
      console.warn('Unable to save log', error);
    }
  }

  async function loadSetup() {
    try {
      const [favoriteRes, logRes, academyRes, indicatorsRes, riskRes] = await Promise.all([
        fetch(buildApiPath('/favorites')),
        fetch(buildApiPath('/logs')),
        fetch(buildApiPath('/academy')),
        fetch(buildApiPath('/indicators')),
        fetch(buildApiPath('/risk-tools'))
      ]);

      setFavorites(await favoriteRes.json());
      setLogs(await logRes.json());
      const academyJson = await academyRes.json();
      setAcademy(academyJson.modules || []);
      setAiBook(academyJson.aiBook || null);
      setIndicatorOptions((await indicatorsRes.json()).available || defaultIndicators);
      setRiskTools((await riskRes.json()).tools || []);
      setOverview((await fetch(buildApiPath('/overview')).then((res) => res.json())) || null);
      setStatusMessage('Analytics modules are ready. Select an asset to start monitoring.');
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to load backend modules. Check server connectivity.');
    }
  }

  async function loadMarket() {
    try {
      setStatusMessage('Loading live dashboard data...');
      const indicatorQuery = selectedIndicators.join(',');
      // If user selected Twelve Data, call provider endpoint which uses TWELVEDATA_KEY on the server
      const endpoint = dataSource === 'twelvedata'
        ? buildApiPath(`/provider/twelvedata/market?symbol=${encodeURIComponent(selectedAsset)}&interval=${encodeURIComponent(mapTimeframe(timeframe))}&indicators=${encodeURIComponent(indicatorQuery)}`)
        : buildApiPath(`/market?category=${category}&symbol=${encodeURIComponent(selectedAsset)}&timeframe=${timeframe}&indicators=${encodeURIComponent(indicatorQuery)}`);

      const response = await fetch(endpoint);
      const data = await response.json();
      setMarketData(data);
      setStatusMessage(`Live ${categoryDisplay} data loaded for ${data.symbol || selectedAsset} (${timeframe}).`);
      pushLog('market load', `${data.symbol || selectedAsset} ${timeframe} [source:${dataSource}]`);
    } catch (error) {
      console.error(error);
      setStatusMessage('Unable to load live market feed.');
    }
  }

  function mapTimeframe(tf) {
    // Map UI timeframe to provider interval strings where reasonable
    switch (tf) {
      case '1m': return '1min';
      case '5m': return '5min';
      case '15m': return '15min';
      case '1h': return '1h';
      case '4h': return '4h';
      case '1d': return '1day';
      case '1w': return '1week';
      case '1M': return '1month';
      case '1y': return '1year';
      default: return tf;
    }
  }

  async function loadSignals() {
    try {
      const response = await fetch(buildApiPath(`/signals?category=${category}`));
      const data = await response.json();
      setSignals(data.signals || []);
    } catch (error) {
      console.error(error);
    }
  }

  async function changeCategory(nextCategory) {
    setCategory(nextCategory);
    const list = assetCatalog[nextCategory] || [];
    setAssetList(list);
    setSelectedAsset(list[0] || 'EUR/USD');
    pushLog('category switch', nextCategory);
  }

  async function addFavorite(symbol) {
    try {
      const response = await fetch(buildApiPath('/favorites'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      setFavorites(await response.json());
      pushLog('favorite add', symbol);
    } catch (error) {
      console.error(error);
    }
  }

  async function removeFavorite(symbol) {
    try {
      const response = await fetch(buildApiPath(`/favorites/${encodeURIComponent(symbol)}`), {
        method: 'DELETE'
      });
      setFavorites(await response.json());
      pushLog('favorite remove', symbol);
    } catch (error) {
      console.error(error);
    }
  }

  async function runAssistant() {
    if (!assistantQuery.trim()) {
      setAssistantAnswer('Please enter a question for the trading assistant.');
      return;
    }
    try {
      const response = await fetch(buildApiPath('/assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: assistantQuery })
      });
      const data = await response.json();
      setAssistantAnswer(data.answer || 'No answer returned.');
      pushLog('assistant query', assistantQuery);
    } catch (error) {
      console.error(error);
      setAssistantAnswer('Assistant service is unavailable.');
    }
  }

  function drawCandlestick() {
    const canvas = chartRef.current;
    if (!canvas || !marketData?.candles?.length) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const candles = marketData.candles;
    const candleWidth = Math.max(4, (width - padding * 2) / candles.length / 1.5);
    const highs = candles.map((item) => item.high);
    const lows = candles.map((item) => item.low);
    const maxPrice = Math.max(...highs);
    const minPrice = Math.min(...lows);
    const range = maxPrice - minPrice || 1;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#07131f';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for (let row = 0; row <= 4; row += 1) {
      const y = padding + (chartHeight / 4) * row;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    candles.forEach((candle, index) => {
      const x = padding + (chartWidth / candles.length) * index + candleWidth / 2;
      const openY = padding + ((maxPrice - candle.open) / range) * chartHeight;
      const closeY = padding + ((maxPrice - candle.close) / range) * chartHeight;
      const highY = padding + ((maxPrice - candle.high) / range) * chartHeight;
      const lowY = padding + ((maxPrice - candle.low) / range) * chartHeight;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(Math.abs(closeY - openY), 2);
      const bullish = candle.close >= candle.open;
      ctx.strokeStyle = bullish ? '#22c55e' : '#ef4444';
      ctx.fillStyle = bullish ? 'rgba(34, 197, 94, 0.24)' : 'rgba(239, 68, 68, 0.24)';
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();
      ctx.fillRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
      ctx.strokeRect(x - candleWidth / 2, bodyTop, candleWidth, bodyHeight);
    });
  }

  function calculatePosition() {
    const entry = Number(entryPrice);
    const stop = Number(stopPrice);
    const acct = Number(accountSize);
    const pct = Number(riskPercent) / 100;
    if (!entry || !stop || !acct || pct <= 0) {
      setCalcResult({ error: 'Enter valid account, entry and stop values.' });
      return;
    }
    const riskPerUnit = Math.abs(entry - stop);
    if (riskPerUnit === 0) {
      setCalcResult({ error: 'Entry and stop cannot be the same.' });
      return;
    }
    const riskAmount = acct * pct;
    const units = Math.floor(riskAmount / riskPerUnit);
    const rr = ((entry - stop) === 0) ? null : (Math.abs(entry - stop));
    setCalcResult({ units, riskAmount: Number(riskAmount.toFixed(2)), riskPerUnit: Number(riskPerUnit.toFixed(6)), rr });
    pushLog('risk calc', `acct:${acct} risk%:${riskPercent} entry:${entry} stop:${stop} units:${units}`);
  }

  function getSessionLocalTime(session) {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const timezone = parseInt(session.timezone, 10);
    const localHours = (utcHours + timezone + 24) % 24;
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(localHours)}:${pad(utcMinutes)}`;
  }

  const currentIndicators = marketData?.indicators || {};
  const currentOverview = marketData?.overview || {};

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI-powered market center</p>
          <h1>pipvision fx</h1>
          <p className="subtitle">Live candlestick monitoring with trading signals, risk management, favorites, academy content, and backend logging.</p>
        </div>
        <div className="top-actions">
          <div className="sessions">
            {(overview?.marketSummary?.sessions || []).map((s) => (
              <span key={s.name} className={`session-chip ${s.active ? 'active' : ''}`}>
                {s.name}
              </span>
            ))}
          </div>
          <span className="status-chip">{overview?.marketSummary?.monitor || '24/7 monitoring'}</span>
        </div>
        <div className="session-guide">
          <div className="time-chip">Local time: {localTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          <div className="session-note">{overview?.marketSummary?.guidance || 'Track your current and upcoming trading sessions below.'}</div>
        </div>
        <div className="session-grid">
          {(overview?.marketSummary?.sessions || []).map((session) => (
            <div key={session.name} className={`session-card ${session.active ? 'active' : ''}`}>
              <div className="session-card-title">
                <span className="session-flag">{session.flag}</span>
                <strong>{session.name}</strong>
                <span className="live-clock">{getSessionLocalTime(session)}</span>
              </div>
              <span>{session.windowUTC}</span>
              <span>{session.localWindow}</span>
            </div>
          ))}
        </div>
      </header>

      <main className="dashboard">
        <section className="controls-grid card">
          <div className="control-block">
            <label>Market category</label>
            <div className="button-group">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={item === category ? 'active' : ''}
                  onClick={() => changeCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="control-block">
            <label>Asset</label>
            <select value={selectedAsset} onChange={(event) => setSelectedAsset(event.target.value)}>
              {assetList.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>

          <div className="control-block">
            <label>Timeframe</label>
            <select value={timeframe} onChange={(event) => setTimeframe(event.target.value)}>
              {timeframes.map((frame) => (
                <option key={frame} value={frame}>
                  {frame}
                </option>
              ))}
            </select>
          </div>

          <div className="control-block">
            <label>Indicators</label>
            <div className="indicator-list">
              {indicatorOptions.map((indicator) => (
                <button
                  type="button"
                  key={indicator}
                  className={selectedIndicators.includes(indicator) ? 'active-indicator' : ''}
                  onClick={() => {
                    setSelectedIndicators((current) =>
                      current.includes(indicator)
                        ? current.filter((name) => name !== indicator)
                        : [...current, indicator]
                    );
                  }}
                >
                  {indicator}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="live-grid">
          <article className="market-panel card">
            <div className="panel-header">
              <div>
                <h2>{selectedAsset}</h2>
                <p>{categoryDisplay} live feed • {timeframe} timeframe</p>

          <div className="control-block">
            <label>Data source</label>
            <div className="button-group">
              <button type="button" className={dataSource === 'simulation' ? 'active' : ''} onClick={() => setDataSource('simulation')}>Simulation</button>
              <button type="button" className={dataSource === 'twelvedata' ? 'active' : ''} onClick={() => setDataSource('twelvedata')}>Twelve Data (Live)</button>
            </div>
            {dataSource === 'twelvedata' && (
              <p className="hint">Using Twelve Data: ensure `TWELVEDATA_KEY` is set in your `.env` and restart the server.</p>
            )}
          </div>
              </div>
              <div className="price-chip">{currentOverview.price ? formatRate(currentOverview.price) : '--'}</div>
            </div>
            <div className="market-meta">
              <span>High: {currentOverview.high ? formatRate(currentOverview.high) : '--'}</span>
              <span>Low: {currentOverview.low ? formatRate(currentOverview.low) : '--'}</span>
              <span>Vol: {currentOverview.volume || '--'}</span>
              <span>Change: {currentOverview.change ? `${currentOverview.change}%` : '--'}</span>
            </div>
            <div className="chart-container">
              <canvas ref={chartRef} width="940" height="320" />
            </div>
            <div className="indicator-summary">
              {Object.entries(currentIndicators).map(([name, value]) => (
                <div key={name} className="indicator-pill">
                  <span>{name}</span>
                  <strong>{typeof value === 'object' ? `${value.lower.toFixed(2)} - ${value.upper.toFixed(2)}` : value}</strong>
                </div>
              ))}
            </div>
            <div className="market-footer">
              <span>{statusMessage}</span>
            </div>
          </article>

          <aside className="side-panel card">
            <div className="panel-header">
              <div>
                <h2>Live signals</h2>
                <p>AI trade ideas for current market conditions.</p>
              </div>
            </div>
            <div className="signal-list">
              {signals.map((signal) => (
                <div key={`${signal.symbol}-${signal.timeframe}`} className={`signal-card ${signal.signal.toLowerCase()}`}>
                  <div>
                    <strong>{signal.symbol}</strong>
                    <span>{signal.signal}</span>
                  </div>
                  <p>{signal.rationale}</p>
                  <div className="signal-meta">
                    <span>{signal.confidence}</span>
                    <span>{signal.timeframe}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="favorites-panel">
              <div className="panel-header">
                <h3>Favorites</h3>
                <button type="button" onClick={() => addFavorite(selectedAsset)}>
                  + Add
                </button>
              </div>
              <ul className="favorite-list">
                {favoriteSummary.map((symbol) => (
                  <li key={symbol}>
                    <span>{symbol}</span>
                    <button type="button" onClick={() => removeFavorite(symbol)}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        <section className="insights-grid">
          <div className="academy-panel card">
            <div className="panel-header">
              <div>
                <h2>Beginner academy</h2>
                <p>Learning modules for live trading, risk management, and effective strategy execution.</p>
              </div>
            </div>
            <div className="academy-content">
              <ul className="academy-list">
                {academy.map((item) => (
                  <li key={item.title}>
                    <strong>{item.title}</strong>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>

              {aiBook && (
                <div className="ai-book">
                  <h3>{aiBook.title}</h3>
                  <p>{aiBook.description}</p>
                  <div className="book-chapters">
                    {aiBook.chapters.map((ch) => (
                      <div key={ch.id} className="chapter">
                        <button type="button" onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}>{ch.title}</button>
                        {openChapter === ch.id && <p className="chapter-content">{ch.content}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="assistant-panel card">
            <div className="panel-header">
              <div>
                <h2>AI trading assistant</h2>
                <p>Ask for trade ideas, risk rules, or entry validation.</p>
              </div>
            </div>
            <textarea
              value={assistantQuery}
              onChange={(event) => setAssistantQuery(event.target.value)}
              placeholder="What should I know before trading this asset?"
            />
            <button type="button" onClick={runAssistant}>Ask assistant</button>
            <div className="assistant-answer">
              <strong>Response</strong>
              <p>{assistantAnswer}</p>
            </div>
          </div>
        </section>

        <section className="utility-row">
          <div className="risk-panel card">
            <div className="panel-header">
              <h2>Risk management</h2>
              <p>Tools and guardrails to protect your capital.</p>
            </div>
            <div className="risk-calculator">
              <div className="calc-row">
                <label>Account size</label>
                <input type="number" value={accountSize} onChange={(e) => setAccountSize(e.target.value)} />
              </div>
              <div className="calc-row">
                <label>Risk % per trade</label>
                <input type="number" value={riskPercent} onChange={(e) => setRiskPercent(e.target.value)} />
              </div>
              <div className="calc-row">
                <label>Entry price</label>
                <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} />
              </div>
              <div className="calc-row">
                <label>Stop price</label>
                <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} />
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="button" onClick={calculatePosition}>Calculate position size</button>
              </div>
              {calcResult && (
                <div className="calc-result">
                  {calcResult.error ? (
                    <div className="error">{calcResult.error}</div>
                  ) : (
                    <div>
                      <div>Risk amount: {calcResult.riskAmount}</div>
                      <div>Risk per unit: {calcResult.riskPerUnit}</div>
                      <div>Suggested units: {calcResult.units}</div>
                    </div>
                  )}
                </div>
              )}
              <hr />
              <ul>
                {riskTools.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="log-panel card">
            <div className="panel-header">
              <h2>Activity log</h2>
              <p>Backend audit trail for trade actions and dashboard events.</p>
            </div>
            <div className="log-list">
              {logs.map((entry) => (
                <div key={`${entry.timestamp}-${entry.action}`} className="log-entry">
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <strong>{entry.action}</strong>
                  <p>{entry.details}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 pipvision fx. Backend logging, multi-asset monitoring, and AI signals in one unified view.</p>
      </footer>
    </div>
  );
}

export default App;
