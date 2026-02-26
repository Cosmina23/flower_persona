const FLOWERS = [
  "lalea",
  "bujor",
  "trandafir",
  "margareta",
  "floarea_soarelui",
  "floare_albastra"
];

const FLOWER_LABELS = {
  lalea: "Lalea",
  bujor: "Bujor",
  trandafir: "Trandafir",
  margareta: "Margaretă",
  floarea_soarelui: "Floarea-soarelui",
  floare_albastra: "Floare albastră"
};

const THEME_CLASS_PREFIX = "theme--";

const THEME_CLASS_BY_FLOWER = {
  lalea: "theme--lalea",
  bujor: "theme--bujor",
  trandafir: "theme--trandafir",
  margareta: "theme--margareta",
  floarea_soarelui: "theme--floarea-soarelui",
  floare_albastra: "theme--floare-albastra"
};

const QUESTIONS = [
  {
    text: "Cum începi, de obicei, o zi bună pentru tine?",
    options: [
      "Cu calm și eleganță, în ritmul meu.",
      "Cu energie caldă și chef de oameni.",
      "Cu pasiune și obiective clare.",
      "Cu zâmbet și lucruri simple.",
      "Cu optimism și planuri curajoase.",
      "Cu reflecție și un gând profund."
    ]
  },
  {
    text: "Într-un grup, cel mai des ești persoana care...",
    options: [
      "păstrează armonia și bunul gust.",
      "ridică moralul tuturor.",
      "inspiră încredere și fermitate.",
      "adună oamenii cu naturalețe.",
      "îi motivează să meargă înainte.",
      "aduce idei sensibile și nuanțate."
    ]
  },
  {
    text: "Ce tip de compliment te bucură cel mai mult?",
    options: [
      "Ai o prezență rafinată.",
      "Ești caldă și generoasă.",
      "Ai forță și clasă.",
      "Ești luminoasă și sinceră.",
      "Ai energie care molipsește.",
      "Ai o sensibilitate rară."
    ]
  },
  {
    text: "Când apare o provocare, primul tău impuls este să...",
    options: [
      "găsești un răspuns echilibrat.",
      "cauți sprijin și construiești împreună.",
      "iei inițiativa cu hotărâre.",
      "păstrezi calmul și claritatea.",
      "activezi rapid resursele disponibile.",
      "analizezi în profunzime situația."
    ]
  },
  {
    text: "Ce atmosferă îți place cel mai mult?",
    options: [
      "Elegantă, aerisită, plină de prospețime.",
      "Caldă, festivă, generoasă.",
      "Intensă, romantică, cu personalitate.",
      "Senină, simplă, prietenoasă.",
      "Vibrantă, solară, plină de viață.",
      "Liniștită, poetică, contemplativă."
    ]
  },
  {
    text: "Ce calitate vrei să transmiți mai departe?",
    options: [
      "Rafinament fără efort.",
      "Grijă autentică față de oameni.",
      "Curaj elegant.",
      "Bucurie sinceră.",
      "Încredere și entuziasm.",
      "Profundime și sensibilitate."
    ]
  },
  {
    text: "La finalul zilei, te simți împlinită când...",
    options: [
      "ai păstrat echilibrul între tine și ceilalți.",
      "ai adus confort emoțional cuiva.",
      "ai dus la capăt ceva important.",
      "ai avut momente simple, dar frumoase.",
      "ai făcut pași mari cu energie bună.",
      "ai înțeles mai bine ce contează pentru tine."
    ]
  }
];

const LOCAL_STORAGE_STOCK_KEY = "quiz_flower_stock_v1";
const INITIAL_STOCK_PER_FLOWER = 6;

const AI_ENDPOINT = "http://localhost:3000/ai-message";

const FLOWER_TRAITS = {
  lalea: ["eleganță", "echilibru", "claritate"],
  bujor: ["căldură", "generozitate", "prezență"],
  trandafir: ["forță", "rafinament", "determinare"],
  margareta: ["sinceritate", "simplitate", "lumină"],
  floarea_soarelui: ["optimism", "curaj", "energie"],
  floare_albastra: ["profunzime", "sensibilitate", "finețe"]
};

const FALLBACK_TEXT = {
  lalea: "Faptul că floarea ta este Laleaua spune despre tine că ai o eleganță firească și un calm care se simte imediat. Îți place să construiești frumos, pas cu pas, fără grabă inutilă. Ai grijă de detalii și faci lucrurile cu bun gust, chiar și în zilele aglomerate. Prezența ta aduce ordine și încredere în jur. Feminitatea ta este clară, discretă și puternică.",
  bujor: "Faptul că floarea ta este Bujorul spune despre tine că ești caldă, deschisă și generoasă cu oamenii tăi. Creezi o atmosferă bună acolo unde apari și îi faci pe ceilalți să se simtă văzuți. Când e nevoie de sprijin real, reacționezi cu inimă și cu claritate. Ai energie blândă, dar fermă, care ține lucrurile împreună. Feminitatea ta are forță și naturalețe.",
  trandafir: "Faptul că floarea ta este Trandafirul spune despre tine că ai intensitate, rafinament și direcție clară. Îți asumi alegerile importante și rămâi fidelă valorilor tale. Vorbești direct când contează și păstrezi eleganța în felul în care te afirmi. Ești atentă la oameni, dar nu renunți la standardele tale. Feminitatea ta îmbină sensibilitatea cu demnitatea.",
  margareta: "Faptul că floarea ta este Margareta spune despre tine că ai o energie luminoasă și o sinceritate care liniștește. Îți place simplitatea bine făcută și găsești bucurie în lucrurile esențiale. Comunici clar, fără artificii, iar cei din jur au încredere în tine. Prezența ta aduce claritate și apropiere în relații. Feminitatea ta este autentică și caldă.",
  floarea_soarelui: "Faptul că floarea ta este Floarea-soarelui spune despre tine că ai curaj, optimism și multă energie de acțiune. Când apare o provocare, găsești rapid direcția și îi mobilizezi și pe ceilalți. Ai un stil direct și pozitiv care dă încredere în momentele dificile. Îți place progresul real și construiești cu entuziasm. Feminitatea ta este solară, sigură și vie.",
  floare_albastra: "Faptul că floarea ta este Floarea albastră spune despre tine că ai profunzime, finețe și un ritm interior bine definit. Observi nuanțe pe care alții le ratează și pui întrebări care contează. În discuții aduci claritate fără să forțezi, iar oamenii se simt ascultați cu adevărat. Îți păstrezi sensibilitatea chiar și când iei decizii ferme. Feminitatea ta este lucidă, calmă și expresivă."
};

let currentQuestionIndex = 0;
let answers = Array(QUESTIONS.length).fill(null);
let currentAssignedFlower = null;
let currentTraits = [];

function pickElement(...ids) {
  for (const id of ids) {
    const element = document.getElementById(id);
    if (element) {
      return element;
    }
  }
  return null;
}

const progressText = pickElement("progress-text");
const progressFill = pickElement("progress-fill");
const startScreen = pickElement("startScreen");
const quizScreen = pickElement("quizScreen");
const startBtn = pickElement("start-btn");
const statusSection = pickElement("status-section");

const quizSection = pickElement("quiz-section");
const questionTitle = pickElement("question-title");
const optionsContainer = pickElement("options");
const errorElement = pickElement("error");

const prevBtn = pickElement("prev-btn");
const nextBtn = pickElement("next-btn");
const finishBtn = pickElement("finish-btn");

const resultSection = pickElement("resultSection", "result-section");
const resultTitle = pickElement("resultFlower", "result-title");
const resultText = pickElement("result-text");
const soldoutMsg = pickElement("soldout-msg");
const aiPanel = pickElement("aiBox", "ai-panel");
const aiLoader = pickElement("aiLoader", "ai-loader");
const aiOutput = pickElement("aiText", "ai-output");

const nextParticipantBtn = pickElement("nextBtn", "next-participant-btn");

function defaultStock() {
  return FLOWERS.reduce((acc, flower) => {
    acc[flower] = INITIAL_STOCK_PER_FLOWER;
    return acc;
  }, {});
}

function sanitizeStock(candidate) {
  const cleanStock = {};
  for (const flower of FLOWERS) {
    const rawValue = candidate && Object.prototype.hasOwnProperty.call(candidate, flower)
      ? Number(candidate[flower])
      : INITIAL_STOCK_PER_FLOWER;
    cleanStock[flower] = Number.isFinite(rawValue) ? Math.max(0, Math.floor(rawValue)) : INITIAL_STOCK_PER_FLOWER;
  }
  return cleanStock;
}

function loadStock() {
  const raw = localStorage.getItem(LOCAL_STORAGE_STOCK_KEY);
  if (!raw) {
    const stock = defaultStock();
    saveStock(stock);
    return stock;
  }
  try {
    const parsed = JSON.parse(raw);
    const stock = sanitizeStock(parsed);
    saveStock(stock);
    return stock;
  } catch {
    const stock = defaultStock();
    saveStock(stock);
    return stock;
  }
}

function saveStock(stock) {
  localStorage.setItem(LOCAL_STORAGE_STOCK_KEY, JSON.stringify(stock));
}

function updateProgressUI() {
  const questionNumber = currentQuestionIndex + 1;
  if (progressText) {
    progressText.textContent = `Întrebarea ${questionNumber}/7`;
  }
  const percent = ((questionNumber / QUESTIONS.length) * 100).toFixed(2);
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
    progressFill.parentElement.setAttribute("aria-valuenow", String(questionNumber));
  }
}

function showError(message) {
  if (!errorElement) {
    return;
  }
  errorElement.textContent = message;
  errorElement.classList.toggle("hidden", !message);
}

function resetAiUi() {
  if (aiLoader) {
    aiLoader.classList.add("hidden");
  }
  if (aiOutput) {
    aiOutput.textContent = "";
  }
}

function setTheme(modeOrFlower) {
  const body = document.body;
  if (!body) {
    return;
  }

  const toRemove = [];
  body.classList.forEach((className) => {
    if (className.startsWith(THEME_CLASS_PREFIX)) {
      toRemove.push(className);
    }
  });
  toRemove.forEach((className) => body.classList.remove(className));

  if (modeOrFlower === "start") {
    body.classList.add("theme--start");
    return;
  }

  if (modeOrFlower === "quiz") {
    body.classList.add("theme--quiz");
    return;
  }

  const flowerTheme = THEME_CLASS_BY_FLOWER[modeOrFlower];
  if (flowerTheme) {
    body.classList.add(flowerTheme);
  } else {
    body.classList.add("theme--quiz");
  }
}

function preloadFrameImages() {
  [
    "./assets/bg-start.png",
    "./assets/bg-lalea.png",
    "./assets/bg-bujor.png",
    "./assets/bg-trandafir.png",
    "./assets/bg-margareta.png",
    "./assets/bg-floarea-soarelui.png",
    "./assets/bg-floare-albastra.png"
  ].forEach((src) => {
    const image = new Image();
    image.src = src;
  });
}

function showStartScreen() {
  if (startScreen) {
    startScreen.classList.remove("hidden");
  }
  if (quizScreen) {
    quizScreen.classList.add("hidden");
  }
  if (statusSection) {
    statusSection.classList.add("hidden");
  }
  if (quizSection) {
    quizSection.classList.add("hidden");
  }
  if (resultSection) {
    resultSection.classList.add("hidden");
  }
  setTheme("start");
}

function startQuizFlow() {
  currentQuestionIndex = 0;
  setTheme("quiz");

  if (startScreen) {
    startScreen.classList.add("hidden");
  }
  if (quizScreen) {
    quizScreen.classList.remove("hidden");
  }
  if (statusSection) {
    statusSection.classList.remove("hidden");
  }
  if (quizSection) {
    quizSection.classList.remove("hidden");
  }
  if (resultSection) {
    resultSection.classList.add("hidden");
  }
  showError("");
  renderQuestion();
}

function renderQuestion() {
  const currentQuestion = QUESTIONS[currentQuestionIndex];
  questionTitle.textContent = currentQuestion.text;
  optionsContainer.innerHTML = "";

  currentQuestion.options.forEach((optionText, optionIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = optionText;
    if (answers[currentQuestionIndex] === optionIndex) {
      button.classList.add("selected");
    }
    button.addEventListener("click", () => {
      answers[currentQuestionIndex] = optionIndex;
      showError("");
      renderQuestion();
    });
    optionsContainer.appendChild(button);
  });

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.classList.toggle("hidden", currentQuestionIndex === QUESTIONS.length - 1);
  finishBtn.classList.toggle("hidden", currentQuestionIndex !== QUESTIONS.length - 1);

  updateProgressUI();
}

function buildRanking(scores) {
  return FLOWERS
    .map((flower) => ({ flower, score: scores[flower] }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return FLOWERS.indexOf(a.flower) - FLOWERS.indexOf(b.flower);
    })
    .map((entry) => entry.flower);
}

function allStockEmpty(stock) {
  return FLOWERS.every((flower) => stock[flower] === 0);
}

function computeScores() {
  const scores = FLOWERS.reduce((acc, flower) => {
    acc[flower] = 0;
    return acc;
  }, {});

  answers.forEach((optionIndex) => {
    const flower = FLOWERS[optionIndex];
    scores[flower] += 1;
  });

  return scores;
}

function buildTraitsForRequest(scores, ranking) {
  const selected = ranking.slice(0, 2);
  const derived = [];
  selected.forEach((flowerKey) => {
    const baseTraits = FLOWER_TRAITS[flowerKey] || [];
    baseTraits.slice(0, 2).forEach((trait) => {
      if (!derived.includes(trait)) {
        derived.push(trait);
      }
    });
  });

  const topScore = scores[ranking[0]];
  derived.push(`scor dominant: ${topScore}`);
  return derived.slice(0, 6);
}

function getLocalFallbackMessage(flower) {
  return FALLBACK_TEXT[flower] || "Faptul că floarea ta este această alegere spune despre tine că ai o prezență feminină clară și autentică. Îți place să construiești cu sens și să fii sinceră în relații. Când iei decizii, păstrezi echilibrul între inimă și pragmatism. Oamenii simt că pot conta pe tine. În felul tău, aduci frumusețe și claritate.";
}

async function requestAiMessage(flower, traits) {
  const response = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      flower,
      traits
    })
  });

  if (!response.ok) {
    throw new Error("AI backend unavailable");
  }

  return response.json();
}

async function finishQuiz() {
  if (answers.some((answer) => answer === null)) {
    showError("Te rog răspunde la toate cele 7 întrebări înainte de rezultat.");
    return;
  }

  showError("");
  const stock = loadStock();

  if (allStockEmpty(stock)) {
    quizSection.classList.add("hidden");
    if (statusSection) {
      statusSection.classList.add("hidden");
    }
    resultSection.classList.remove("hidden");
    aiPanel.classList.add("hidden");
    resultTitle.textContent = "Rezultat indisponibil";
    resultText.textContent = "";
    setTheme("quiz");
    soldoutMsg.classList.remove("hidden");
    return;
  }

  const scores = computeScores();
  const ranking = buildRanking(scores);
  const assignedFlower = ranking.find((flower) => stock[flower] > 0);

  if (!assignedFlower) {
    quizSection.classList.add("hidden");
    if (statusSection) {
      statusSection.classList.add("hidden");
    }
    resultSection.classList.remove("hidden");
    aiPanel.classList.add("hidden");
    resultTitle.textContent = "Rezultat indisponibil";
    resultText.textContent = "";
    setTheme("quiz");
    soldoutMsg.classList.remove("hidden");
    return;
  }

  stock[assignedFlower] -= 1;
  saveStock(stock);

  currentAssignedFlower = assignedFlower;
  currentTraits = buildTraitsForRequest(scores, ranking);

  quizSection.classList.add("hidden");
  if (statusSection) {
    statusSection.classList.add("hidden");
  }
  resultSection.classList.remove("hidden");
  aiPanel.classList.remove("hidden");
  soldoutMsg.classList.add("hidden");
  resultTitle.textContent = `Floarea ta este: ${FLOWER_LABELS[assignedFlower]}`;
  setTheme(assignedFlower);
  resultText.textContent = "Interpretarea ta personalizată este generată automat mai jos.";
  resetAiUi();
  await handleGenerateAiMessage();
}

function resetQuizOnly() {
  answers = Array(QUESTIONS.length).fill(null);
  currentQuestionIndex = 0;
  currentAssignedFlower = null;
  currentTraits = [];
  if (resultSection) {
    resultSection.classList.add("hidden");
  }
  if (soldoutMsg) {
    soldoutMsg.classList.add("hidden");
  }
  if (aiPanel) {
    aiPanel.classList.add("hidden");
  }
  setTheme("start");
  resetAiUi();
  showError("");
  showStartScreen();
}

async function handleGenerateAiMessage() {
  if (!currentAssignedFlower) {
    return;
  }

  if (aiLoader) {
    aiLoader.classList.remove("hidden");
  }

  try {
    const data = await requestAiMessage(currentAssignedFlower, currentTraits);
    const text = typeof data?.text === "string" && data.text.trim()
      ? data.text.trim()
      : getLocalFallbackMessage(currentAssignedFlower);
    if (aiOutput) {
      aiOutput.textContent = text;
    }
  } catch {
    if (aiOutput) {
      aiOutput.textContent = getLocalFallbackMessage(currentAssignedFlower);
    }
  } finally {
    if (aiLoader) {
      aiLoader.classList.add("hidden");
    }
  }
}

prevBtn?.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex -= 1;
    showError("");
    renderQuestion();
  }
});

nextBtn?.addEventListener("click", () => {
  if (answers[currentQuestionIndex] === null) {
    showError("Alege un răspuns ca să mergi mai departe.");
    return;
  }
  if (currentQuestionIndex < QUESTIONS.length - 1) {
    currentQuestionIndex += 1;
    showError("");
    renderQuestion();
  }
});

finishBtn?.addEventListener("click", finishQuiz);
nextParticipantBtn?.addEventListener("click", resetQuizOnly);
startBtn?.addEventListener("click", startQuizFlow);

preloadFrameImages();
resetAiUi();
showStartScreen();