interface StartScreenProps {
  onStart: () => void;
  onOpenStudio: () => void;
}

export default function StartScreen({ onStart, onOpenStudio }: StartScreenProps) {
  return (
    <section className="start-screen" aria-live="polite">
      <div className="start-screen__content">
        <h1>Quiz de personalitate: ce floare ești?</h1>
        <p className="start-text">
          Bine ai venit! Răspunde la 7 întrebări și descoperă floarea ta.
        </p>
        <div className="actions actions-stacked">
          <button type="button" className="btn btn-primary" onClick={onStart}>
            Începe quiz-ul
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenStudio}
          >
            🎨 Studio Ilustrații
          </button>
        </div>
      </div>
    </section>
  );
}
