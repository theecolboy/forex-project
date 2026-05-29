export default function MarketNewsPage({ marketNews, loadNews, selectedAsset }) {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'impact-high';
      case 'medium': return 'impact-medium';
      case 'low': return 'impact-low';
      default: return '';
    }
  };

  return (
    <div className="news-page card">
      <div className="panel-header">
        <h2>Market News</h2>
        <p>Latest financial news and market analysis.</p>
      </div>

      <button type="button" onClick={loadNews} className="refresh-news">Refresh News</button>

      <div className="news-list">
        {marketNews.length === 0 ? (
          <p>No news available. Click "Refresh News" to load latest updates.</p>
        ) : (
          marketNews.map((news, idx) => (
            <div key={idx} className={`news-item ${getImpactColor(news.impact)}`}>
              <div className="news-header">
                <span className="news-time">{new Date(news.time).toLocaleTimeString()}</span>
                <span className={`news-impact ${getImpactColor(news.impact)}`}>{news.impact.toUpperCase()} IMPACT</span>
              </div>
              <h3>{news.title}</h3>
              <p>{news.summary}</p>
              <div className="news-footer">
                <span className="news-source">{news.source}</span>
                <span className="news-currency">{news.currency}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}