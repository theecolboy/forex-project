const quickPrompts = [
  'Analyze entry, stop, and target for the current setup',
  'What risk rules should I use before taking this trade?',
  'List the main reasons to avoid this trade'
];

export default function AIAssistantPage({
  assistantQuery,
  setAssistantQuery,
  assistantAnswer,
  assistantLoading,
  assistantHistory,
  runAssistant,
  selectedAsset,
  timeframe
}) {
  function handleSubmit(event) {
    event.preventDefault();
    runAssistant();
  }

  return (
    <div className="assistant-page card">
      <div className="panel-header">
        <h2>🤖 AI trading assistant</h2>
        <p>{selectedAsset} analysis on {timeframe}. Ask one question or paste several queries at once.</p>
      </div>

      <div className="assistant-prompts" aria-label="Assistant prompt shortcuts">
        {quickPrompts.map((prompt) => (
          <button type="button" key={prompt} onClick={() => runAssistant(prompt)}>
            {prompt}
          </button>
        ))}
      </div>

      <form className="assistant-form" onSubmit={handleSubmit}>
        <textarea
          value={assistantQuery}
          onChange={(e) => setAssistantQuery(e.target.value)}
          placeholder="Example: Should I buy EUR/USD now? Where should the stop go? What invalidates the setup?"
        />
        <button type="submit" disabled={assistantLoading}>
          {assistantLoading ? 'Analyzing...' : 'Ask assistant'}
        </button>
      </form>

      <div className="assistant-answer">
        <strong>Response</strong>
        <p>{assistantAnswer}</p>
      </div>

      {assistantHistory.length > 0 && (
        <div className="assistant-history">
          <h3>Recent queries</h3>
          {assistantHistory.map((item) => (
            <article key={`${item.timestamp}-${item.query}`}>
              <strong>{item.query}</strong>
              {item.meta && (
                <span>{item.meta.symbol} / {item.meta.timeframe} / {item.meta.bias}</span>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
