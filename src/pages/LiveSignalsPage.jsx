export default function LiveSignalsPage({ signals }) {
  return (
    <div className="signals-page card">
      <div className="panel-header">
        <h2>Live signals</h2>
        <p>AI trade ideas for current market conditions.</p>
      </div>
      <div className="signal-list">
        {signals.length === 0 ? (
          <p>No signals available. Load market data to generate signals.</p>
        ) : (
          signals.map((signal) => (
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
          ))
        )}
      </div>
    </div>
  );
}