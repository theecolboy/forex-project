export default function AIAssistantPage({ assistantQuery, setAssistantQuery, assistantAnswer, runAssistant }) {
  return (
    <div className="assistant-page card">
      <div className="panel-header">
        <h2>AI trading assistant</h2>
        <p>Ask for trade ideas, risk rules, or entry validation.</p>
      </div>
      <textarea
        value={assistantQuery}
        onChange={(e) => setAssistantQuery(e.target.value)}
        placeholder="What should I know before trading this asset?"
      />
      <button type="button" onClick={runAssistant}>Ask assistant</button>
      <div className="assistant-answer">
        <strong>Response</strong>
        <p>{assistantAnswer}</p>
      </div>
    </div>
  );
}