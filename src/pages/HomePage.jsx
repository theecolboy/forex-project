import { Link } from 'react-router-dom';

function getSessionLocalTime(session) {
  const now = new Date();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const timezone = parseInt(session.timezone, 10);
  const localHours = (utcHours + timezone + 24) % 24;
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(localHours)}:${pad(utcMinutes)}`;
}

export default function HomePage({ overview, localTime, favoriteSummary, favorites, addFavorite, removeFavorite }) {
  return (
    <div className="home-page">
      <header className="topbar">
        <div className="hero-copy">
          <p className="eyebrow">🤖 AI-powered market center</p>
          <h1>pipvision fx</h1>
          <p className="subtitle">Live candlestick monitoring with trading signals, risk management, favorites, academy content, and backend logging.</p>
          <div className="hero-stats">
            <span>🕯️ Live candles</span>
            <span>⚡ AI signals</span>
            <span>🛡️ Risk tools</span>
          </div>
        </div>
        <div className="hero-image" role="img" aria-label="Trading desk with market charts">
          <div className="hero-image-overlay">
            <strong>Market desk</strong>
            <span>Sessions, candles, and signals in one view</span>
          </div>
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
                <span className="live-clock">{getSessionLocalTime(session)}</span>
              </div>
              <span>{session.windowUTC}</span>
              <span>{session.localWindow}</span>
            </div>
          ))}
        </div>
      </header>

      <section className="favorites-section">
        <h2>⭐ Favorites</h2>
        <div className="favorites-panel">
          <div className="panel-header">
            <h3>💼 Your watchlist</h3>
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
          <Link to="/trade" className="btn-primary">🚀 Start Trading</Link>
          <Link to="/signals" className="btn-secondary">⚡ View Signals</Link>
          <Link to="/risk" className="btn-secondary">🛡️ Risk Calculator</Link>
        </div>

        <div className="feature-tiles">
          <Link to="/news" className="feature-tile news-tile">
            <span>📰</span>
            <strong>Market news</strong>
            <p>Track catalysts and session-moving headlines.</p>
          </Link>
          <Link to="/assistant" className="feature-tile assistant-tile">
            <span>🤖</span>
            <strong>AI assistant</strong>
            <p>Ask for entries, stops, targets, and risk checks.</p>
          </Link>
          <Link to="/academy" className="feature-tile academy-tile">
            <span>🎓</span>
            <strong>FX academy</strong>
            <p>Learn basics, psychology, strategy, and books.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
