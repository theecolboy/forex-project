import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import TradeViewPage from './pages/TradeViewPage.jsx';
import LiveSignalsPage from './pages/LiveSignalsPage.jsx';
import AIAssistantPage from './pages/AIAssistantPage.jsx';
import RiskManagementPage from './pages/RiskManagementPage.jsx';
import AcademyPage from './pages/AcademyPage.jsx';
import ActivityLogPage from './pages/ActivityLogPage.jsx';
import IndicatorPage from './pages/IndicatorPage.jsx';
import TradingViewPage from './pages/TradingViewPage.jsx';

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
  return `/api${path}`;
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
  const [riskPercent, setRiskPercent] = useState(1);
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
    setCalcResult({ units, riskAmount: Number(riskAmount.toFixed(2)), riskPerUnit: Number(riskPerUnit.toFixed(6)) });
    pushLog('risk calc', `acct:${acct} risk%:${riskPercent} entry:${entry} stop:${stop} units:${units}`);
  }

  const currentIndicators = marketData?.indicators || {};
  const currentOverview = marketData?.overview || {};

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={
            <HomePage
              overview={overview}
              localTime={localTime}
              favoriteSummary={favoriteSummary}
              favorites={favorites}
              addFavorite={addFavorite}
              removeFavorite={removeFavorite}
            />
          } />
          <Route path="trade" element={
            <TradeViewPage
              category={category}
              categories={categories}
              assetCatalog={assetCatalog}
              selectedAsset={selectedAsset}
              assetList={assetList}
              timeframe={timeframe}
              timeframes={timeframes}
              selectedIndicators={selectedIndicators}
              indicatorOptions={indicatorOptions}
              marketData={marketData}
              chartRef={chartRef}
              statusMessage={statusMessage}
              currentOverview={currentOverview}
              currentIndicators={currentIndicators}
              dataSource={dataSource}
              changeCategory={changeCategory}
              setSelectedAsset={setSelectedAsset}
              setTimeframe={setTimeframe}
              setSelectedIndicators={setSelectedIndicators}
            />
          } />
          <Route path="signals" element={<LiveSignalsPage signals={signals} />} />
          <Route path="assistant" element={
            <AIAssistantPage
              assistantQuery={assistantQuery}
              setAssistantQuery={setAssistantQuery}
              assistantAnswer={assistantAnswer}
              runAssistant={runAssistant}
            />
          } />
          <Route path="risk" element={
            <RiskManagementPage
              accountSize={accountSize}
              setAccountSize={setAccountSize}
              riskPercent={riskPercent}
              setRiskPercent={setRiskPercent}
              entryPrice={entryPrice}
              setEntryPrice={setEntryPrice}
              stopPrice={stopPrice}
              setStopPrice={setStopPrice}
              calcResult={calcResult}
              calculatePosition={calculatePosition}
              riskTools={riskTools}
            />
          } />
          <Route path="academy" element={
            <AcademyPage
              academy={academy}
              aiBook={aiBook}
              openChapter={openChapter}
              setOpenChapter={setOpenChapter}
            />
          } />
          <Route path="activity" element={<ActivityLogPage logs={logs} />} />
          <Route path="indicators" element={
            <IndicatorPage
              selectedIndicators={selectedIndicators}
              indicatorOptions={indicatorOptions}
              setSelectedIndicators={setSelectedIndicators}
              changeCategory={changeCategory}
              categories={categories}
              category={category}
              assetCatalog={assetCatalog}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              timeframes={timeframes}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          } />
          <Route path="trading" element={
            <TradingViewPage
              assistantQuery={assistantQuery}
              setAssistantQuery={setAssistantQuery}
              runAssistant={runAssistant}
              assistantAnswer={assistantAnswer}
              marketData={marketData}
              selectedAsset={selectedAsset}
              entryPrice={entryPrice}
              setEntryPrice={setEntryPrice}
              stopPrice={stopPrice}
              setStopPrice={setStopPrice}
              accountSize={accountSize}
              setAccountSize={setAccountSize}
              riskPercent={riskPercent}
              setRiskPercent={setRiskPercent}
              calculatePosition={calculatePosition}
              calcResult={calcResult}
              setCalcResult={setCalcResult}
            />
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;