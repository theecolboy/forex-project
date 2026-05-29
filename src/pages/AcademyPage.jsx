export default function AcademyPage({ academy, aiBook, openChapter, setOpenChapter }) {
  return (
    <div className="academy-page card">
      <div className="panel-header">
        <h2>Beginner academy</h2>
        <p>Learning modules for live trading, risk management, and effective strategy execution.</p>
      </div>

      <div className="academy-content">
        <ul className="academy-list">
          {academy.map((item) => (
            <li key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>

        {aiBook && (
          <div className="ai-book">
            <h3>{aiBook.title}</h3>
            <p>{aiBook.description}</p>
            <div className="book-chapters">
              {aiBook.chapters.map((ch) => (
                <div key={ch.id} className="chapter">
                  <button type="button" onClick={() => setOpenChapter(openChapter === ch.id ? null : ch.id)}>{ch.title}</button>
                  {openChapter === ch.id && <p className="chapter-content">{ch.content}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}