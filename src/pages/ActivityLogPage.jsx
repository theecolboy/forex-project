export default function ActivityLogPage({ logs }) {
  return (
    <div className="log-page card">
      <div className="panel-header">
        <h2>Activity log</h2>
        <p>Backend audit trail for trade actions and dashboard events.</p>
      </div>
      <div className="log-list">
        {logs.length === 0 ? (
          <p>No activity recorded yet.</p>
        ) : (
          logs.map((entry) => (
            <div key={`${entry.timestamp}-${entry.action}`} className="log-entry">
              <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
              <strong>{entry.action}</strong>
              <p>{entry.details}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}