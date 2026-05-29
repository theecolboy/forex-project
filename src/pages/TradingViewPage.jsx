import { useState } from 'react';

export default function TradingViewPage({ assistantQuery, setAssistantQuery, runAssistant, assistantAnswer, marketData, selectedAsset, entryPrice, setEntryPrice, stopPrice, setStopPrice, accountSize, setAccountSize, riskPercent, setRiskPercent, calculatePosition, calcResult, setCalcResult }) {
  const [orderType, setOrderType] = useState('market');
  const [orderSide, setOrderSide] = useState('buy');
  const [orderSize, setOrderSize] = useState(100000);

  const currentPrice = marketData?.overview?.price || 0;

  return (
    <div className="trading-view-page">
      <section className="trading-layout">
        <div className="order-panel card">
          <div className="panel-header">
            <h2>Place Order</h2>
            <p>{selectedAsset} @ {currentPrice.toFixed(4)}</p>
          </div>

          <div className="order-controls">
            <div className="control-block">
              <label>Order Type</label>
              <div className="button-group">
                <button type="button" className={orderType === 'market' ? 'active' : ''} onClick={() => setOrderType('market')}>Market</button>
                <button type="button" className={orderType === 'limit' ? 'active' : ''} onClick={() => setOrderType('limit')}>Limit</button>
              </div>
            </div>

            <div className="control-block">
              <label>Side</label>
              <div className="button-group">
                <button type="button" className={`buy ${orderSide === 'buy' ? 'active' : ''}`} onClick={() => setOrderSide('buy')}>BUY</button>
                <button type="button" className={`sell ${orderSide === 'sell' ? 'active' : ''}`} onClick={() => setOrderSide('sell')}>SELL</button>
              </div>
            </div>

            <div className="control-block">
              <label>Size (units)</label>
              <input type="number" value={orderSize} onChange={(e) => setOrderSize(e.target.value)} />
            </div>

            {orderType === 'limit' && (
              <div className="control-block">
                <label>Limit Price</label>
                <input type="number" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} placeholder="Enter limit price" />
              </div>
            )}

            <div className="control-block">
              <label>Stop Loss</label>
              <input type="number" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="Stop loss price" />
            </div>

            <button type="button" className="place-order-btn">
              {orderSide.toUpperCase()} {orderType === 'market' ? 'NOW' : 'ORDER'}
            </button>

            <hr />
            <button type="button" onClick={() => {
              setAssistantQuery(`Analyze ${selectedAsset} for potential ${orderSide} entry`);
              runAssistant();
            }}>
              Analyze with AI
            </button>
          </div>
        </div>

        <div className="risk-calculator-panel card">
          <div className="panel-header">
            <h2>Risk Calculator</h2>
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
            <button type="button" onClick={calculatePosition}>Calculate</button>
            {calcResult && (
              <div className="calc-result">
                {calcResult.error ? (
                  <div className="error">{calcResult.error}</div>
                ) : (
                  <div className="result-details">
                    <div>Units: <strong>{calcResult.units}</strong></div>
                    <div>Risk: <strong>{calcResult.riskAmount}</strong></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {assistantAnswer && !calcResult && (
        <div className="assistant-insight card">
          <strong>AI Analysis:</strong>
          <p>{assistantAnswer}</p>
        </div>
      )}
    </div>
  );
}