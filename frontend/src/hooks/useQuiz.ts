import { useState, useCallback } from "react";
import {
  FLOWERS,
  FALLBACK_QUESTIONS,
  FLOWER_LABELS,
  FLOWER_TRAITS,
  type FlowerKey,
  type Question,
} from "../data/questions";
import { loadStock, saveStock, allStockEmpty } from "../utils/stock";
import { fetchQuizQuestions } from "../services/api";

export type Screen = "start" | "loading" | "quiz" | "result";

export interface QuizResult {
  flower: FlowerKey;
  label: string;
  traits: string[];
  soldout: boolean;
}

function computeScores(answers: (number | null)[]): Record<FlowerKey, number> {
  const scores = FLOWERS.reduce((acc, f) => {
    acc[f] = 0;
    return acc;
  }, {} as Record<FlowerKey, number>);

  answers.forEach((optIdx) => {
    if (optIdx !== null) {
      const flower = FLOWERS[optIdx];
      scores[flower] += 1;
    }
  });
  return scores;
}

function buildRanking(scores: Record<FlowerKey, number>): FlowerKey[] {
  return [...FLOWERS]
    .map((f) => ({ flower: f, score: scores[f] }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return FLOWERS.indexOf(a.flower) - FLOWERS.indexOf(b.flower);
    })
    .map((e) => e.flower);
}

function buildTraits(
  scores: Record<FlowerKey, number>,
  ranking: FlowerKey[]
): string[] {
  const selected = ranking.slice(0, 2);
  const derived: string[] = [];
  selected.forEach((key) => {
    const base = FLOWER_TRAITS[key] ?? [];
    base.slice(0, 2).forEach((t) => {
      if (!derived.includes(t)) derived.push(t);
    });
  });
  derived.push(`scor dominant: ${scores[ranking[0]]}`);
  return derived.slice(0, 6);
}

export function useQuiz() {
  const [screen, setScreen] = useState<Screen>("start");
  const [questions, setQuestions] = useState<Question[]>(FALLBACK_QUESTIONS);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(7).fill(null)
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");

  const selectOption = useCallback(
    (optIdx: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[questionIndex] = optIdx;
        return next;
      });
      setError("");
    },
    [questionIndex]
  );

  const goNext = useCallback(() => {
    if (answers[questionIndex] === null) {
      setError("Alege un răspuns ca să mergi mai departe.");
      return;
    }
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((i) => i + 1);
      setError("");
    }
  }, [questionIndex, answers, questions.length]);

  const goPrev = useCallback(() => {
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
      setError("");
    }
  }, [questionIndex]);

  const finish = useCallback((): QuizResult | null => {
    if (answers.some((a) => a === null)) {
      setError("Te rog răspunde la toate cele 7 întrebări înainte de rezultat.");
      return null;
    }
    setError("");

    const stock = loadStock();

    if (allStockEmpty(stock)) {
      const soldoutResult: QuizResult = {
        flower: "lalea",
        label: "Rezultat indisponibil",
        traits: [],
        soldout: true,
      };
      setResult(soldoutResult);
      setScreen("result");
      return soldoutResult;
    }

    const scores = computeScores(answers);
    const ranking = buildRanking(scores);
    const assigned = ranking.find((f) => stock[f] > 0);

    if (!assigned) {
      const soldoutResult: QuizResult = {
        flower: "lalea",
        label: "Rezultat indisponibil",
        traits: [],
        soldout: true,
      };
      setResult(soldoutResult);
      setScreen("result");
      return soldoutResult;
    }

    stock[assigned] -= 1;
    saveStock(stock);

    const traits = buildTraits(scores, ranking);
    const quizResult: QuizResult = {
      flower: assigned,
      label: FLOWER_LABELS[assigned],
      traits,
      soldout: false,
    };
    setResult(quizResult);
    setScreen("result");
    return quizResult;
  }, [answers]);

  const reset = useCallback(() => {
    setAnswers(Array(7).fill(null));
    setQuestionIndex(0);
    setQuestions(FALLBACK_QUESTIONS);
    setResult(null);
    setError("");
    setScreen("start");
  }, []);

  const startQuiz = useCallback(async () => {
    setScreen("loading");
    setError("");
    try {
      const qs = await fetchQuizQuestions();
      setQuestions(qs);
      setAnswers(Array(qs.length).fill(null));
    } catch {
      setQuestions(FALLBACK_QUESTIONS);
      setAnswers(Array(FALLBACK_QUESTIONS.length).fill(null));
    }
    setQuestionIndex(0);
    setScreen("quiz");
  }, []);

  return {
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
  };
}
