import { FALLBACK_TEXT, FALLBACK_QUESTIONS, type FlowerKey, type Question } from "../data/questions";

const DEFAULT_FALLBACK =
  "Faptul că floarea ta este această alegere spune despre tine că ai o prezență feminină clară și autentică. Îți place să construiești cu sens și să fii sinceră în relații. Când iei decizii, păstrezi echilibrul între inimă și pragmatism. Oamenii simt că pot conta pe tine. În felul tău, aduci frumusețe și claritate.";

function getApiBase(): string {
  return import.meta.env.VITE_API_URL || "/api";
}

export function getLocalFallback(flower: FlowerKey): string {
  return FALLBACK_TEXT[flower] ?? DEFAULT_FALLBACK;
}

export async function fetchQuizQuestions(): Promise<Question[]> {
  try {
    const res = await fetch(`${getApiBase()}/generate-quiz`);
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    if (
      Array.isArray(data?.questions) &&
      data.questions.length === 7 &&
      data.questions.every(
        (q: unknown) =>
          typeof q === "object" &&
          q !== null &&
          typeof (q as Record<string, unknown>).text === "string" &&
          Array.isArray((q as Record<string, unknown>).options) &&
          ((q as Record<string, unknown>).options as unknown[]).length === 6
      )
    ) {
      return data.questions as Question[];
    }
    return FALLBACK_QUESTIONS;
  } catch {
    return FALLBACK_QUESTIONS;
  }
}

export async function generateIllustration(
  slots: { file: File; flower: FlowerKey }[]
): Promise<{ image: string }> {
  const formData = new FormData();
  for (const s of slots) {
    formData.append("photos", s.file);
    formData.append("flowers", s.flower);
  }

  const res = await fetch(`${getApiBase()}/generate-illustration`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as Record<string, string>).error || "Generarea a eșuat."
    );
  }
  return res.json();
}

export async function fetchAiMessage(
  flower: FlowerKey,
  traits: string[]
): Promise<{ text: string; source: string }> {
  try {
    const res = await fetch(`${getApiBase()}/ai-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flower, traits }),
    });
    if (!res.ok) throw new Error("API error");
    const data = await res.json();
    const text =
      typeof data?.text === "string" && data.text.trim()
        ? data.text.trim()
        : getLocalFallback(flower);
    return { text, source: data?.source ?? "fallback" };
  } catch {
    return { text: getLocalFallback(flower), source: "fallback" };
  }
}
