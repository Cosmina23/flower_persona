const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

const FLOWER_LABELS = {
  lalea: "Laleaua",
  bujor: "Bujorul",
  trandafir: "Trandafirul",
  margareta: "Margareta",
  floarea_soarelui: "Floarea-soarelui",
  floare_albastra: "Floarea albastră"
};

const FALLBACK_TEXTS = {
  lalea: "Faptul că floarea ta este Laleaua spune despre tine că ai o eleganță firească și un calm care se simte imediat. Îți place să construiești frumos, pas cu pas, fără grabă inutilă. Ai grijă de detalii și faci lucrurile cu bun gust, chiar și în zilele aglomerate. Prezența ta aduce ordine și încredere în jur. Feminitatea ta este clară, discretă și puternică.",
  bujor: "Faptul că floarea ta este Bujorul spune despre tine că ești caldă, deschisă și generoasă cu oamenii tăi. Creezi o atmosferă bună acolo unde apari și îi faci pe ceilalți să se simtă văzuți. Când e nevoie de sprijin real, reacționezi cu inimă și cu claritate. Ai energie blândă, dar fermă, care ține lucrurile împreună. Feminitatea ta are forță și naturalețe.",
  trandafir: "Faptul că floarea ta este Trandafirul spune despre tine că ai intensitate, rafinament și direcție clară. Îți asumi alegerile importante și rămâi fidelă valorilor tale. Vorbești direct când contează și păstrezi eleganța în felul în care te afirmi. Ești atentă la oameni, dar nu renunți la standardele tale. Feminitatea ta îmbină sensibilitatea cu demnitatea.",
  margareta: "Faptul că floarea ta este Margareta spune despre tine că ai o energie luminoasă și o sinceritate care liniștește. Îți place simplitatea bine făcută și găsești bucurie în lucrurile esențiale. Comunici clar, fără artificii, iar cei din jur au încredere în tine. Prezența ta aduce claritate și apropiere în relații. Feminitatea ta este autentică și caldă.",
  floarea_soarelui: "Faptul că floarea ta este Floarea-soarelui spune despre tine că ai curaj, optimism și multă energie de acțiune. Când apare o provocare, găsești rapid direcția și îi mobilizezi și pe ceilalți. Ai un stil direct și pozitiv care dă încredere în momentele dificile. Îți place progresul real și construiești cu entuziasm. Feminitatea ta este solară, sigură și vie.",
  floare_albastra: "Faptul că floarea ta este Floarea albastră spune despre tine că ai profunzime, finețe și un ritm interior bine definit. Observi nuanțe pe care alții le ratează și pui întrebări care contează. În discuții aduci claritate fără să forțezi, iar oamenii se simt ascultați cu adevărat. Îți păstrezi sensibilitatea chiar și când iei decizii ferme. Feminitatea ta este lucidă, calmă și expresivă."
};

app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500"
      ];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

function sanitizeTraits(traits) {
  if (!Array.isArray(traits)) {
    return [];
  }
  return traits
    .filter((value) => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function getFallbackText(flowerKey) {
  return (
    FALLBACK_TEXTS[flowerKey] ||
    "Faptul că floarea ta este această alegere spune despre tine că ai o prezență feminină clară și autentică. Îți place să construiești cu sens și să fii sinceră în relații. Când iei decizii, păstrezi echilibrul între inimă și pragmatism. Oamenii simt că pot conta pe tine. În felul tău, aduci frumusețe și claritate."
  );
}

async function requestOpenAI({ flowerLabel, traits }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const traitsLine = traits.length > 0 ? traits.join(", ") : "fără indicii suplimentare";

  const systemPrompt = "Scrii în română pentru femei, poetic dar clar, fără metafore obscure, fără clișee, fără limbaj psihologic sau diagnostic.";
  const userPrompt = [
    `Generează EXACT 4-5 propoziții despre semnificația unei flori de personalitate.`,
    `Textul trebuie să înceapă EXACT cu: „Faptul că floarea ta este ${flowerLabel} spune despre tine că…”`,
    `Folosește ca indicii aceste trăsături: ${traitsLine}.`,
    "Nu adăuga titlu, listă sau introducere suplimentară."
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      max_completion_tokens: 260,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("OpenAI response missing text");
  }
  return text;
}

app.post("/ai-message", async (req, res) => {
  const flower = typeof req.body?.flower === "string" ? req.body.flower.trim() : "";
  const traits = sanitizeTraits(req.body?.traits);

  if (!FLOWER_LABELS[flower]) {
    res.status(400).json({
      text: "Floare invalidă.",
      source: "fallback"
    });
    return;
  }

  const flowerLabel = FLOWER_LABELS[flower];

  try {
    const text = await requestOpenAI({ flowerLabel, traits });
    res.json({ text, source: "ai" });
  } catch {
    res.json({
      text: getFallbackText(flower),
      source: "fallback"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Quiz + AI backend local pornit pe http://localhost:${PORT}`);
});
