export default function RiskManagementPage({ accountSize, setAccountSize, riskPercent, setRiskPercent, entryPrice, setEntryPrice, stopPrice, setStopPrice, calcResult, calculatePosition, riskTools }) {
  return (
    <div className="risk-page card">
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
        <h3>Risk tools</h3>
        <ul>
          {riskTools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}