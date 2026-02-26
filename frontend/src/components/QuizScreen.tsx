import type { Question } from "../data/questions";

interface QuizScreenProps {
  questions: Question[];
  questionIndex: number;
  answers: (number | null)[];
  error: string;
  onSelect: (optionIndex: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
}

export default function QuizScreen({
  questions,
  questionIndex,
  answers,
  error,
  onSelect,
  onNext,
  onPrev,
  onFinish,
}: QuizScreenProps) {
  const question = questions[questionIndex];
  const questionNumber = questionIndex + 1;
  const isLast = questionIndex === questions.length - 1;
  const percent = ((questionNumber / questions.length) * 100).toFixed(2);

  return (
    <main className="shell">
      <section className="frame">
        <div className="panel">
          <h1>Quiz de personalitate: ce floare ești?</h1>

          {/* Progress */}
          <section className="status-card" aria-live="polite">
            <p className="progress-text">
              Întrebarea {questionNumber}/{questions.length}
            </p>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={questions.length}
              aria-valuenow={questionNumber}
            >
              <div
                className="progress-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </section>

          {/* Question */}
          <section className="card" aria-live="polite">
            <h2 className="question-title">{question.text}</h2>
            <div className="options">
              {question.options.map((text, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`option-btn${
                    answers[questionIndex] === idx ? " selected" : ""
                  }`}
                  onClick={() => onSelect(idx)}
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={questionIndex === 0}
                onClick={onPrev}
              >
                Înapoi
              </button>
              {!isLast ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onNext}
                >
                  Următoarea întrebare
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onFinish}
                >
                  Vezi rezultatul
                </button>
              )}
            </div>
            {error && <p className="error">{error}</p>}
          </section>
        </div>
      </section>
    </main>
  );
}
