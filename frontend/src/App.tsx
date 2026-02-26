import { useEffect, useState } from "react";
import { useQuiz } from "./hooks/useQuiz";
import { setTheme, preloadImages } from "./utils/theme";
import StartScreen from "./components/StartScreen";
import QuizScreen from "./components/QuizScreen";
import ResultScreen from "./components/ResultScreen";
import PhotoStudio from "./components/PhotoStudio";

export default function App() {
  const {
    screen,
    questions,
    questionIndex,
    answers,
    result,
    error,
    selectOption,
    goNext,
    goPrev,
    finish,
    reset,
    startQuiz,
  } = useQuiz();

  const [showStudio, setShowStudio] = useState(false);

  // Preload background images once
  useEffect(() => {
    preloadImages();
  }, []);

  // Theme switching based on screen / result
  useEffect(() => {
    if (showStudio) {
      setTheme("start");
      return;
    }
    if (screen === "start") {
      setTheme("start");
    } else if (screen === "quiz") {
      setTheme("quiz");
    } else if (screen === "result" && result && !result.soldout) {
      setTheme(result.flower);
    } else {
      setTheme("quiz");
    }
  }, [screen, result, showStudio]);

  if (showStudio) {
    return <PhotoStudio onClose={() => setShowStudio(false)} />;
  }

  if (screen === "start") {
    return (
      <StartScreen
        onStart={startQuiz}
        onOpenStudio={() => setShowStudio(true)}
      />
    );
  }

  if (screen === "loading") {
    return (
      <section className="start-screen" aria-live="polite">
        <div className="start-screen__content">
          <h1>Quiz de personalitate: ce floare ești?</h1>
          <p className="start-text">Se generează întrebările tale unice…</p>
          <div className="ai-loader">Se încarcă…</div>
        </div>
      </section>
    );
  }

  if (screen === "quiz") {
    return (
      <QuizScreen
        questions={questions}
        questionIndex={questionIndex}
        answers={answers}
        error={error}
        onSelect={selectOption}
        onNext={goNext}
        onPrev={goPrev}
        onFinish={finish}
      />
    );
  }

  if (screen === "result" && result) {
    return <ResultScreen result={result} onReset={reset} />;
  }

  return null;
}
