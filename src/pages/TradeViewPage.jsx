import { useParams } from 'react-router-dom';

import { useEffect, useRef } from 'react';

export default function TradeViewPage({ category, categories, assetCatalog, selectedAsset, assetList, timeframe, timeframes, selectedIndicators, indicatorOptions, marketData, chartRef, statusMessage, currentOverview, currentIndicators, dataSource, changeCategory, setSelectedAsset, setTimeframe, setSelectedIndicators, loadMarket, calculatePosition, accountSize, setAccountSize, riskPercent, setRiskPercent, entryPrice, setEntryPrice, stopPrice, setStopPrice, calcResult }) {

  const formatRate = (rate) => rate.toFixed(rate > 10 ? 2 : 4);

  const localChartRef = chartRef;

  useEffect(() => {
    if (localChartRef.current && marketData?.candles?.length) {
      const ctx = localChartRef.current.getContext('2d');
      const width = localChartRef.current.width;
      const height = localChartRef.current.height;
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
  }, [marketData]);

  return (
    <div className="trade-view-page">
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
          <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)}>
            {assetList.map((asset) => (
              <option key={asset} value={asset}>{asset}</option>
            ))}
          </select>
        </div>

        <div className="control-block">
          <label>Timeframe</label>
          <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            {timeframes.map((frame) => (
              <option key={frame} value={frame}>{frame}</option>
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

        <div className="control-block">
          <label>Data source</label>
          <div className="button-group">
            <button type="button" className={dataSource === 'simulation' ? 'active' : ''} onClick={() => loadMarket()}>Simulation</button>
            <button type="button" className={dataSource === 'twelvedata' ? 'active' : ''} onClick={() => loadMarket()}>Twelve Data (Live)</button>
          </div>
        </div>
      </section>

      <article className="market-panel card">
        <div className="panel-header">
          <div>
            <h2>{selectedAsset}</h2>
            <p>{category} live feed • {timeframe} timeframe</p>
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
    </div>
  );
}