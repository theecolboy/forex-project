export default function TradeViewPage({
  category,
  categories,
  selectedAsset,
  assetList,
  timeframe,
  timeframes,
  selectedIndicators,
  indicatorOptions,
  chartRef,
  statusMessage,
  currentOverview,
  currentIndicators,
  dataSource,
  changeCategory,
  setSelectedAsset,
  setTimeframe,
  setSelectedIndicators,
  setDataSource,
  loadMarket
}) {
  const formatRate = (rate) => rate.toFixed(rate > 10 ? 2 : 4);

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
            <button type="button" className={dataSource === 'simulation' ? 'active' : ''} onClick={() => setDataSource('simulation')}>Simulation</button>
            <button type="button" className={dataSource === 'twelvedata' ? 'active' : ''} onClick={() => setDataSource('twelvedata')}>Twelve Data</button>
          </div>
        </div>
      </section>

      <article className="market-panel card">
        <div className="panel-header">
          <div>
            <h2>{selectedAsset}</h2>
            <p>🕯️ {category} live feed - {timeframe} timeframe</p>
          </div>
          <div className="price-stack">
            <span className="live-badge">Live moving</span>
            <div className="price-chip">{currentOverview.price ? formatRate(currentOverview.price) : '--'}</div>
          </div>
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
