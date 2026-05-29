export default function IndicatorPage({ selectedIndicators, indicatorOptions, setSelectedIndicators, changeCategory, categories, category, assetCatalog, selectedAsset, setSelectedAsset, timeframes, timeframe, setTimeframe }) {
  return (
    <div className="indicator-page card">
      <div className="panel-header">
        <h2>Indicators & Timeframes</h2>
        <p>Configure your analysis parameters.</p>
      </div>

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
          {assetCatalog[category]?.map((asset) => (
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

      <div className="indicator-section">
        <h3>Active indicators</h3>
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
    </div>
  );
}