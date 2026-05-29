export default function AcademyPage({ academy, aiBook, recommendedBooks, openChapter, setOpenChapter }) {
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
              {item.lessons && (
                <ul className="lesson-list">
                  {item.lessons.map((lesson) => (
                    <li key={lesson}>{lesson}</li>
                  ))}
                </ul>
              )}
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

        {recommendedBooks.length > 0 && (
          <div className="recommended-books">
            <h3>Recommended books</h3>
            <div className="book-list">
              {recommendedBooks.map((book) => (
                <article key={book.title} className="book-card">
                  <div>
                    <strong>{book.title}</strong>
                    <span>{book.author}</span>
                  </div>
                  <small>{book.level}</small>
                  <p>{book.why}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
