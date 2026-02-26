import { useEffect, useState } from "react";
import type { QuizResult } from "../hooks/useQuiz";
import { fetchAiMessage, getLocalFallback } from "../services/api";
import type { FlowerKey } from "../data/questions";

interface ResultScreenProps {
  result: QuizResult;
  onReset: () => void;
}

export default function ResultScreen({ result, onReset }: ResultScreenProps) {
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (result.soldout) return;

    let cancelled = false;
    setLoading(true);
    setAiText("");

    fetchAiMessage(result.flower as FlowerKey, result.traits).then((data) => {
      if (!cancelled) {
        setAiText(data.text);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [result]);

  if (result.soldout) {
    return (
      <main className="shell">
        <section className="frame">
          <div className="panel">
            <h1>Quiz de personalitate: ce floare ești?</h1>
            <section className="card" aria-live="polite">
              <h2>Rezultat indisponibil</h2>
              <p className="soldout">
                Ne pare rău, toate brelocurile s-au epuizat.
              </p>
              <div className="actions actions-stacked">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onReset}
                >
                  Următoarea participantă
                </button>
              </div>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="frame">
        <div className="panel">
          <h1>Quiz de personalitate: ce floare ești?</h1>
          <section className="card" aria-live="polite">
            <h2>Floarea ta este: {result.label}</h2>
            <p className="result-text">
              Interpretarea ta personalizată este generată automat mai jos.
            </p>

            <div className="ai-panel">
              {loading && (
                <p className="ai-loader">AI generează…</p>
              )}
              <h3 className="ai-heading">Mesaj generat de AI</h3>
              <p className="ai-output">
                {aiText || (loading ? "" : getLocalFallback(result.flower as FlowerKey))}
              </p>
            </div>

            <div className="actions actions-stacked">
              <button
                type="button"
                className="btn btn-primary"
                onClick={onReset}
              >
                Următoarea participantă
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
