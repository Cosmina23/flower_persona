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
    text: "Ai un deadline strâns și tre' să livrezi. Cum abordezi?",
    options: [
      "Structurez totul pas cu pas, fără panică.",
      "Adun echipa și delegăm inteligent.",
      "Preiau controlul și prioritizez pe loc.",
      "Simplific ce se poate și mă focusez pe esențial.",
      "Intru în modul turbo și trag tare.",
      "Mă retrag o oră să gândesc un plan solid.",
    ],
  },
  {
    text: "Ce rol ai, de obicei, într-un proiect de echipă?",
    options: [
      "Organizez și mă asigur că totul e coerent.",
      "Sunt liantul — țin echipa conectată.",
      "Coordonez și dau direcția principală.",
      "Fac treaba bine, fără să complic.",
      "Sunt cea care împinge lucrurile înainte.",
      "Vin cu perspective pe care alții le ratează.",
    ],
  },
  {
    text: "Un coleg vine la tine frustrat de o situație la lucru. Ce faci?",
    options: [
      "Ascult calm și îl ajut să vadă lucrurile obiectiv.",
      "Îi ofer susținere și mă asigur că se simte auzit.",
      "Îi dau un sfat direct și aplicabil.",
      "Îl las să vorbească, apoi simplific problema.",
      "Îl motivez să treacă la acțiune.",
      "Pun întrebări care îl ajută să-și dea seama singur.",
    ],
  },
  {
    text: "Ce te enervează cel mai tare într-un mediu de lucru?",
    options: [
      "Haosul și lipsa de structură.",
      "Lipsa de respect între colegi.",
      "Indeciziile care trag de timp.",
      "Complicarea inutilă a lucrurilor simple.",
      "Pasivitatea când trebuie acționat.",
      "Superficialitatea în decizii importante.",
    ],
  },
  {
    text: "Cum arată un meeting reușit pentru tine?",
    options: [
      "Agendă clară, fiecare punct acoperit, fără devieri.",
      "Toată lumea a participat și s-a simțit inclusă.",
      "S-au luat decizii concrete și s-au stabilit responsabili.",
      "A fost scurt, la obiect și cu next steps clare.",
      "S-a ieșit de acolo cu energie și motivație.",
      "S-au discutat lucruri de fond, nu doar operațional.",
    ],
  },
  {
    text: "Cum reacționezi la feedback negativ?",
    options: [
      "Îl procesez rațional și extrag ce e util.",
      "Verific mai întâi intenția persoanei.",
      "Îl accept dacă e valid, îl resping dacă nu e.",
      "Nu dramatizez — iau ce e de luat și merg mai departe.",
      "Mă motivează să dovedesc contrariul.",
      "Mă gândesc mult la el, dar ajung la concluzii bune.",
    ],
  },
  {
    text: "Cum îți alegi prioritățile când totul pare urgent?",
    options: [
      "Fac o matrice de impact și urgență.",
      "Consult echipa să vedem ce afectează pe toată lumea.",
      "Decid rapid ce contează cel mai mult și acționez.",
      "Elimin ce nu e cu adevărat necesar.",
      "Le iau pe rând, dar cu viteză.",
      "Mă opresc, analizez panorama completă, apoi decid.",
    ],
  },
  {
    text: "Ți se propune un proiect complet nou, în afara zonei tale. Ce simți?",
    options: [
      "Entuziasm controlat — vreau să-l abordez metodic.",
      "Mă bucur dacă e în echipă și învățăm împreună.",
      "Accept provocarea — e o oportunitate să cresc.",
      "Sunt OK dacă regulile sunt clare de la început.",
      "Super! Adrenalina asta mă face productivă.",
      "Curiozitate — vreau să înțeleg bine înainte să mă bag.",
    ],
  },
  {
    text: "Ce contează cel mai mult pentru tine la locul de muncă?",
    options: [
      "Un mediu ordonat și profesionist.",
      "Relații bune și respect reciproc.",
      "Oportunități de creștere și impact real.",
      "Să-mi fac treaba bine, fără dramă.",
      "Dinamism și proiecte care mișcă lucrurile.",
      "Sens în ceea ce fac și spațiu de gândire.",
    ],
  },
  {
    text: "Cum comunici o veste proastă echipei?",
    options: [
      "Clar, structurat, cu soluții deja pregătite.",
      "Empatic, dar sincer — le arăt că suntem împreună.",
      "Direct și fără ocolișuri, cu un plan de acțiune.",
      "Simplu și transparent, fără să dramatizez.",
      "Rapid, cu focus pe ce facem de acum încolo.",
      "Cu context și nuanțe, să înțeleagă toată situația.",
    ],
  },
  {
    text: "La ce te uiți prima dată când primești un task nou?",
    options: [
      "Termenul și resursele disponibile.",
      "Cine mai e implicat și cum ne sincronizăm.",
      "Rezultatul final așteptat.",
      "Ce anume trebuie livrat concret.",
      "Cât de repede pot începe.",
      "De ce se face și ce problemă rezolvă.",
    ],
  },
  {
    text: "Cum te descurci cu ambiguitatea la job?",
    options: [
      "Creez structură acolo unde nu există.",
      "Vorbesc cu oamenii până se clarifică lucrurile.",
      "Iau o decizie și ajustez pe parcurs.",
      "Mă concentrez pe ce e clar și pornesc de acolo.",
      "Experimentez rapid și văd ce merge.",
      "Stau cu întrebarea până ajung la un răspuns bun.",
    ],
  },
  {
    text: "Ce tip de lider te inspiră cel mai mult?",
    options: [
      "Cel strategic, care vede imaginea de ansamblu.",
      "Cel care creează un mediu sigur pentru echipă.",
      "Cel decis, care nu se ferește de responsabilitate.",
      "Cel pragmatic, care livrează constant.",
      "Cel energic, care mobilizează oamenii.",
      "Cel vizionar, care pune întrebările potrivite.",
    ],
  },
  {
    text: "Cum te reîncarci după o săptămână grea la lucru?",
    options: [
      "Cu ordine acasă și un weekend structurat.",
      "Cu oamenii dragi, în conversații faine.",
      "Cu ceva ce-mi dă satisfacție personală.",
      "Cu liniște, aer curat și lucruri simple.",
      "Cu mișcare, energie și activități noi.",
      "Cu carte, muzică sau timp cu mine.",
    ],
  },
  {
    text: "Dacă ar trebui să descrii stilul tău de lucru într-un cuvânt?",
    options: [
      "Metodic.",
      "Colaborativ.",
      "Hotărât.",
      "Eficient.",
      "Dinamic.",
      "Reflexiv.",
    ],
  },
  {
    text: "Cum gestionezi conflictele între colegi?",
    options: [
      "Mediez rațional, cu reguli clare.",
      "Ascult ambele părți și caut un numitor comun.",
      "Le spun direct ce cred și propun o soluție.",
      "Reduc tensiunea la fapte concrete.",
      "Intervin rapid ca să nu escaladeze.",
      "Observ dinamica înainte să intervin.",
    ],
  },
  {
    text: "Cum arată inbox-ul tău de email?",
    options: [
      "Organizat pe foldere, zero inbox cât se poate.",
      "Răspund rapid, mai ales la oamenii importanți.",
      "Prioritizat — ce contează e rezolvat imediat.",
      "Simplu și curat, fără subscripții inutile.",
      "Citesc și acționez pe loc — nu le las să se adune.",
      "Unele mailuri le recitesc de mai multe ori ca să fiu sigură.",
    ],
  },
  {
    text: "Ți se cere să ții o prezentare pe un subiect nou. Cum te pregătești?",
    options: [
      "Fac research serios și slide-uri ordonate.",
      "Vorbesc cu colegi care știu subiectul.",
      "Mă focusez pe mesajul principal și impact.",
      "O fac simplă, vizuală și la obiect.",
      "O fac interactivă și plină de energie.",
      "Intru adânc în subiect, caut unghiuri noi.",
    ],
  },
  {
    text: "Ce te face să rămâi motivată pe termen lung?",
    options: [
      "Progresul vizibil și consistența.",
      "Oamenii buni cu care lucrez.",
      "Provocările care mă forțează să cresc.",
      "Satisfacția de a face lucruri bine.",
      "Proiectele noi și impactul direct.",
      "Sensul profund al muncii mele.",
    ],
  },
  {
    text: "Cum reacționezi când cineva îți contestă ideea într-un meeting?",
    options: [
      "Argumentez calm, cu date și logică.",
      "Ascult perspectiva lor și caut ground comun.",
      "Îmi susțin punctul de vedere cu fermitate.",
      "Dacă au dreptate, accept fără ego.",
      "Dezbat deschis — mă alimentează.",
      "Reflectez dacă nu cumva au un punct valid.",
    ],
  },
  {
    text: "Cum te simți în legătură cu schimbările de strategie la job?",
    options: [
      "Le accept dacă sunt justificate, dar vreau un plan clar.",
      "Mă adaptez ușor dacă echipa e aliniată.",
      "Le văd ca pe oportunități de luat inițiativă.",
      "Le urmez fără dramă, atât timp cât au sens.",
      "Mă entuziasmează — e o șansă de refresh.",
      "Le analizez critic înainte să le îmbrățișez.",
    ],
  },
  {
    text: "Ce apreciezi cel mai mult la un coleg?",
    options: [
      "Fiabilitatea și atenția la detalii.",
      "Empatia și disponibilitatea.",
      "Competența și asumarea.",
      "Onestitatea și simplitatea.",
      "Inițiativa și curajul.",
      "Inteligența emoțională și profunzimea.",
    ],
  },
  {
    text: "Ce faci când ai o idee nouă la lucru?",
    options: [
      "O documentez clar înainte să o propun.",
      "O discut mai întâi cu cineva de încredere.",
      "O prezint direct celor care decid.",
      "O testez discret să văd dacă funcționează.",
      "O arunc pe masă cu entuziasm.",
      "O las să se coacă până e bine conturată.",
    ],
  },
  {
    text: "Cum îți organizezi ziua de lucru?",
    options: [
      "Cu to-do list structurat și time blocks.",
      "Flexibil, dar cu check-in-uri cu echipa.",
      "Prioritizat pe impact — big rocks first.",
      "Simplu: ce-i urgent, ce-i important, restul poate.",
      "Rapid dimineața, intens la prânz, debrief seara.",
      "Depinde de starea mea — mă adaptez zilnic.",
    ],
  },
  {
    text: "Cum te descrii în faza de brainstorming?",
    options: [
      "Organizez ideile celorlalți și le dau structură.",
      "Încurajez pe toată lumea să contribuie.",
      "Propun direcții clare și provoc echipa.",
      "Filtrez ce e aplicabil din tot ce se zice.",
      "Generez idei rapid, volum mare.",
      "Vin cu o idee neașteptată după ce toți au terminat.",
    ],
  },
  {
    text: "Ce te frustrează la proiectele lungi?",
    options: [
      "Când se pierde consistența pe parcurs.",
      "Când echipa se deconectează emoțional.",
      "Când nu se iau decizii și totul stagnează.",
      "Când se complică fără motiv.",
      "Când ritmul scade și nu se mai simte progresul.",
      "Când se uită scopul inițial.",
    ],
  },
  {
    text: "E vineri și ai terminat tot ce aveai de făcut. Ce faci?",
    options: [
      "Pregătesc săptămâna viitoare.",
      "Verific dacă cineva are nevoie de ajutor.",
      "Încep ceva nou care mă provocă.",
      "Plec liniștită, fără vinovăție.",
      "Propun ceva spontan echipei.",
      "Citesc sau învăț ceva ce mă interesează.",
    ],
  },
  {
    text: "Cum abordezi o decizie importantă la lucru?",
    options: [
      "Analizez opțiunile sistematic, cu pro și contra.",
      "Iau pulsul echipei și ascult diverse opinii.",
      "Merg pe instinct informat și asum rezultatul.",
      "Aleg varianta cea mai simplă și funcțională.",
      "Decid rapid și corectez pe parcurs dacă e nevoie.",
      "Iau timp să reflectez, apoi decid cu convingere.",
    ],
  },
  {
    text: "Ce tip de recunoaștere contează cel mai mult pentru tine la job?",
    options: [
      "Să mi se aprecieze calitatea și consistența muncii.",
      "Să mi se mulțumească sincer și personal.",
      "Să mi se dea responsabilități mai mari.",
      "Să mi se spună simplu: ai făcut treabă bună.",
      "Să fiu vizibilă și creditată pentru rezultate.",
      "Să se observe gândirea din spatele muncii mele.",
    ],
  },
  {
    text: "Dacă ar trebui să alegi un motto pentru stilul tău profesional?",
    options: [
      "Excelența e în detalii.",
      "Împreună ajungem mai departe.",
      "Cine vrea, găsește soluții.",
      "Simplu, clar, făcut bine.",
      "Acțiunea bate perfecțiunea.",
      "Sens înainte de viteză.",
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
