export default function MarketNewsPage({ marketNews, loadNews, selectedAsset }) {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'HIGH' };
      case 'medium': return { bg: 'rgba(251, 191, 36, 0.15)', text: '#fcd34d', label: 'MED' };
      case 'low': return { bg: 'rgba(34, 197, 94, 0.15)', text: '#86efac', label: 'LOW' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', text: '#cbd5e1', label: 'N/A' };
    }
  };

  return (
    <div className="news-page card">
      <div className="panel-header">
        <h2>📈 Market News & Analysis</h2>
        <p>Live updates on how news affects {selectedAsset} and market sessions.</p>
      </div>

      <button type="button" onClick={loadNews} className="refresh-news">Refresh News Feed</button>

      <div className="news-list">
        {marketNews.length === 0 ? (
          <div className="news-placeholder">
            <p>No news loaded. Click "Refresh News Feed" to get updates.</p>
            <p><strong>Tip:</strong> Select Gold in commodities to see precious metals news.</p>
          </div>
        ) : (
          marketNews.map((news, idx) => {
            const impact = getImpactColor(news.impact);
            return (
              <div key={idx} className="news-item" style={{ backgroundColor: impact.bg }}>
                <div className="news-header">
                  <span className="news-time">{new Date(news.time).toLocaleTimeString()}</span>
                  <span className="news-impact" style={{ color: impact.text }}>{impact.label} IMPACT</span>
                </div>
                <h3>{news.title}</h3>
                <p>{news.summary}</p>
                <div className="news-footer">
                  <span className="news-source">📍 {news.source}</span>
                  <span className="news-currency">💱 {news.currency}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}