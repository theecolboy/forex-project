import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="main-layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-brand">📈 pipvision fx</Link>
          <div className="nav-links">
            <Link to="/">🏠 Home</Link>
            <Link to="/trade">💹 Trade</Link>
            <Link to="/trading">🕯️ Trading View</Link>
            <Link to="/indicators">📊 Indicators</Link>
            <Link to="/signals">⚡ Signals</Link>
            <Link to="/news">📰 News</Link>
            <Link to="/assistant">🤖 AI Assistant</Link>
            <Link to="/risk">🛡️ Risk</Link>
            <Link to="/academy">🎓 Academy</Link>
            <Link to="/activity">📋 Activity</Link>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>© 2026 pipvision fx. Multi-asset monitoring and AI signals in one unified view.</p>
      </footer>
    </div>
  );
}
