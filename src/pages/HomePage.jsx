import { Link } from 'react-router-dom';

export default function HomePage({ overview, localTime, favoriteSummary, favorites, addFavorite, removeFavorite }) {
  return (
    <div className="home-page">
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
                {s.flag} {s.name}
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
              </div>
              <span>{session.windowUTC}</span>
              <span>{session.localWindow}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="favorites-section">
        <h2>Favorites</h2>
        <div className="favorites-panel">
          <div className="panel-header">
            <h3>Your watchlist</h3>
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

        <div className="quick-actions">
          <Link to="/trade" className="btn-primary">Start Trading</Link>
          <Link to="/signals" className="btn-secondary">View Signals</Link>
          <Link to="/risk" className="btn-secondary">Risk Calculator</Link>
        </div>
      </section>
    </div>
  );
}