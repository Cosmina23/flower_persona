export const FLOWERS = [
  "lalea",
  "bujor",
  "trandafir",
  "margareta",
  "floarea_soarelui",
  "floare_albastra",
] as const;

export type FlowerKey = (typeof FLOWERS)[number];

export const FLOWER_LABELS: Record<FlowerKey, string> = {
  lalea: "Lalea",
  bujor: "Bujor",
  trandafir: "Trandafir",
  margareta: "Margaretă",
  floarea_soarelui: "Floarea-soarelui",
  floare_albastra: "Floare albastră",
};

export const THEME_CLASS_BY_FLOWER: Record<FlowerKey, string> = {
  lalea: "theme--lalea",
  bujor: "theme--bujor",
  trandafir: "theme--trandafir",
  margareta: "theme--margareta",
  floarea_soarelui: "theme--floarea-soarelui",
  floare_albastra: "theme--floare-albastra",
};

export interface Question {
  text: string;
  options: string[];
}

export const QUESTIONS: Question[] = [
  {
    text: "Cum începi, de obicei, o zi bună pentru tine?",
    options: [
      "Cu calm și eleganță, în ritmul meu.",
      "Cu energie caldă și chef de oameni.",
      "Cu pasiune și obiective clare.",
      "Cu zâmbet și lucruri simple.",
      "Cu optimism și planuri curajoase.",
      "Cu reflecție și un gând profund.",
    ],
  },
  {
    text: "Într-un grup, cel mai des ești persoana care...",
    options: [
      "păstrează armonia și bunul gust.",
      "ridică moralul tuturor.",
      "inspiră încredere și fermitate.",
      "adună oamenii cu naturalețe.",
      "îi motivează să meargă înainte.",
      "aduce idei sensibile și nuanțate.",
    ],
  },
  {
    text: "Ce tip de compliment te bucură cel mai mult?",
    options: [
      "Ai o prezență rafinată.",
      "Ești caldă și generoasă.",
      "Ai forță și clasă.",
      "Ești luminoasă și sinceră.",
      "Ai energie care molipsește.",
      "Ai o sensibilitate rară.",
    ],
  },
  {
    text: "Când apare o provocare, primul tău impuls este să...",
    options: [
      "găsești un răspuns echilibrat.",
      "cauți sprijin și construiești împreună.",
      "iei inițiativa cu hotărâre.",
      "păstrezi calmul și claritatea.",
      "activezi rapid resursele disponibile.",
      "analizezi în profunzime situația.",
    ],
  },
  {
    text: "Ce atmosferă îți place cel mai mult?",
    options: [
      "Elegantă, aerisită, plină de prospețime.",
      "Caldă, festivă, generoasă.",
      "Intensă, romantică, cu personalitate.",
      "Senină, simplă, prietenoasă.",
      "Vibrantă, solară, plină de viață.",
      "Liniștită, poetică, contemplativă.",
    ],
  },
  {
    text: "Ce calitate vrei să transmiți mai departe?",
    options: [
      "Rafinament fără efort.",
      "Grijă autentică față de oameni.",
      "Curaj elegant.",
      "Bucurie sinceră.",
      "Încredere și entuziasm.",
      "Profundime și sensibilitate.",
    ],
  },
  {
    text: "La finalul zilei, te simți împlinită când...",
    options: [
      "ai păstrat echilibrul între tine și ceilalți.",
      "ai adus confort emoțional cuiva.",
      "ai dus la capăt ceva important.",
      "ai avut momente simple, dar frumoase.",
      "ai făcut pași mari cu energie bună.",
      "ai înțeles mai bine ce contează pentru tine.",
    ],
  },
];

// Alias used as fallback when AI-generated questions fail
export const FALLBACK_QUESTIONS: Question[] = QUESTIONS;

export const FLOWER_TRAITS: Record<FlowerKey, string[]> = {
  lalea: ["eleganță", "echilibru", "claritate"],
  bujor: ["căldură", "generozitate", "prezență"],
  trandafir: ["forță", "rafinament", "determinare"],
  margareta: ["sinceritate", "simplitate", "lumină"],
  floarea_soarelui: ["optimism", "curaj", "energie"],
  floare_albastra: ["profunzime", "sensibilitate", "finețe"],
};

export const FALLBACK_TEXT: Record<FlowerKey, string> = {
  lalea:
    "Faptul că floarea ta este Laleaua spune despre tine că ai o eleganță firească și un calm care se simte imediat. Îți place să construiești frumos, pas cu pas, fără grabă inutilă. Ai grijă de detalii și faci lucrurile cu bun gust, chiar și în zilele aglomerate. Prezența ta aduce ordine și încredere în jur. Feminitatea ta este clară, discretă și puternică.",
  bujor:
    "Faptul că floarea ta este Bujorul spune despre tine că ești caldă, deschisă și generoasă cu oamenii tăi. Creezi o atmosferă bună acolo unde apari și îi faci pe ceilalți să se simtă văzuți. Când e nevoie de sprijin real, reacționezi cu inimă și cu claritate. Ai energie blândă, dar fermă, care ține lucrurile împreună. Feminitatea ta are forță și naturalețe.",
  trandafir:
    "Faptul că floarea ta este Trandafirul spune despre tine că ai intensitate, rafinament și direcție clară. Îți asumi alegerile importante și rămâi fidelă valorilor tale. Vorbești direct când contează și păstrezi eleganța în felul în care te afirmi. Ești atentă la oameni, dar nu renunți la standardele tale. Feminitatea ta îmbină sensibilitatea cu demnitatea.",
  margareta:
    "Faptul că floarea ta este Margareta spune despre tine că ai o energie luminoasă și o sinceritate care liniștește. Îți place simplitatea bine făcută și găsești bucurie în lucrurile esențiale. Comunici clar, fără artificii, iar cei din jur au încredere în tine. Prezența ta aduce claritate și apropiere în relații. Feminitatea ta este autentică și caldă.",
  floarea_soarelui:
    "Faptul că floarea ta este Floarea-soarelui spune despre tine că ai curaj, optimism și multă energie de acțiune. Când apare o provocare, găsești rapid direcția și îi mobilizezi și pe ceilalți. Ai un stil direct și pozitiv care dă încredere în momentele dificile. Îți place progresul real și construiești cu entuziasm. Feminitatea ta este solară, sigură și vie.",
  floare_albastra:
    "Faptul că floarea ta este Floarea albastră spune despre tine că ai profunzime, finețe și un ritm interior bine definit. Observi nuanțe pe care alții le ratează și pui întrebări care contează. În discuții aduci claritate fără să forțezi, iar oamenii se simt ascultați cu adevărat. Îți păstrezi sensibilitatea chiar și când iei decizii ferme. Feminitatea ta este lucidă, calmă și expresivă.",
};

export const INITIAL_STOCK_PER_FLOWER = 6;
