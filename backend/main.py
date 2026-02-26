import os
import json
import base64
import random
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import AzureOpenAI

app = FastAPI(title="Flower Quiz AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FLOWER_LABELS = {
    "lalea": "Laleaua",
    "bujor": "Bujorul",
    "trandafir": "Trandafirul",
    "margareta": "Margareta",
    "floarea_soarelui": "Floarea-soarelui",
    "floare_albastra": "Floarea albastră",
}

FALLBACK_TEXTS = {
    "lalea": "Faptul că floarea ta este Laleaua spune despre tine că ai o eleganță firească și un calm care se simte imediat. Îți place să construiești frumos, pas cu pas, fără grabă inutilă. Ai grijă de detalii și faci lucrurile cu bun gust, chiar și în zilele aglomerate. Prezența ta aduce ordine și încredere în jur. Feminitatea ta este clară, discretă și puternică.",
    "bujor": "Faptul că floarea ta este Bujorul spune despre tine că ești caldă, deschisă și generoasă cu oamenii tăi. Creezi o atmosferă bună acolo unde apari și îi faci pe ceilalți să se simtă văzuți. Când e nevoie de sprijin real, reacționezi cu inimă și cu claritate. Ai energie blândă, dar fermă, care ține lucrurile împreună. Feminitatea ta are forță și naturalețe.",
    "trandafir": "Faptul că floarea ta este Trandafirul spune despre tine că ai intensitate, rafinament și direcție clară. Îți asumi alegerile importante și rămâi fidelă valorilor tale. Vorbești direct când contează și păstrezi eleganța în felul în care te afirmi. Ești atentă la oameni, dar nu renunți la standardele tale. Feminitatea ta îmbină sensibilitatea cu demnitatea.",
    "margareta": "Faptul că floarea ta este Margareta spune despre tine că ai o energie luminoasă și o sinceritate care liniștește. Îți place simplitatea bine făcută și găsești bucurie în lucrurile esențiale. Comunici clar, fără artificii, iar cei din jur au încredere în tine. Prezența ta aduce claritate și apropiere în relații. Feminitatea ta este autentică și caldă.",
    "floarea_soarelui": "Faptul că floarea ta este Floarea-soarelui spune despre tine că ai curaj, optimism și multă energie de acțiune. Când apare o provocare, găsești rapid direcția și îi mobilizezi și pe ceilalți. Ai un stil direct și pozitiv care dă încredere în momentele dificile. Îți place progresul real și construiești cu entuziasm. Feminitatea ta este solară, sigură și vie.",
    "floare_albastra": "Faptul că floarea ta este Floarea albastră spune despre tine că ai profunzime, finețe și un ritm interior bine definit. Observi nuanțe pe care alții le ratează și pui întrebări care contează. În discuții aduci claritate fără să forțezi, iar oamenii se simt ascultați cu adevărat. Îți păstrezi sensibilitatea chiar și când iei decizii ferme. Feminitatea ta este lucidă, calmă și expresivă.",
}

DEFAULT_FALLBACK = (
    "Faptul că floarea ta este această alegere spune despre tine că ai o prezență "
    "feminină clară și autentică. Îți place să construiești cu sens și să fii sinceră "
    "în relații. Când iei decizii, păstrezi echilibrul între inimă și pragmatism. "
    "Oamenii simt că pot conta pe tine. În felul tău, aduci frumusețe și claritate."
)


class AiMessageRequest(BaseModel):
    flower: str
    traits: list[str] = []


def sanitize_traits(traits: list[str]) -> list[str]:
    clean = []
    for t in traits:
        if isinstance(t, str):
            stripped = t.strip()
            if stripped:
                clean.append(stripped)
    return clean[:8]


def get_fallback(flower: str) -> str:
    return FALLBACK_TEXTS.get(flower, DEFAULT_FALLBACK)


def get_azure_openai_client() -> AzureOpenAI | None:
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    if not api_key or not endpoint:
        return None
    return AzureOpenAI(
        api_key=api_key,
        azure_endpoint=endpoint,
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
    )


# ── Fallback questions (used when AI is unavailable) ──
FALLBACK_QUESTIONS = [
    {
        "text": "Cum începi, de obicei, o zi bună pentru tine?",
        "options": [
            "Cu calm și eleganță, în ritmul meu.",
            "Cu energie caldă și chef de oameni.",
            "Cu pasiune și obiective clare.",
            "Cu zâmbet și lucruri simple.",
            "Cu optimism și planuri curajoase.",
            "Cu reflecție și un gând profund.",
        ],
    },
    {
        "text": "Într-un grup, cel mai des ești persoana care...",
        "options": [
            "păstrează armonia și bunul gust.",
            "ridică moralul tuturor.",
            "inspiră încredere și fermitate.",
            "adună oamenii cu naturalețe.",
            "îi motivează să meargă înainte.",
            "aduce idei sensibile și nuanțate.",
        ],
    },
    {
        "text": "Ce tip de compliment te bucură cel mai mult?",
        "options": [
            "Ai o prezență rafinată.",
            "Ești caldă și generoasă.",
            "Ai forță și clasă.",
            "Ești luminoasă și sinceră.",
            "Ai energie care molipsește.",
            "Ai o sensibilitate rară.",
        ],
    },
    {
        "text": "Când apare o provocare, primul tău impuls este să...",
        "options": [
            "găsești un răspuns echilibrat.",
            "cauți sprijin și construiești împreună.",
            "iei inițiativa cu hotărâre.",
            "păstrezi calmul și claritatea.",
            "activezi rapid resursele disponibile.",
            "analizezi în profunzime situația.",
        ],
    },
    {
        "text": "Ce atmosferă îți place cel mai mult?",
        "options": [
            "Elegantă, aerisită, plină de prospețime.",
            "Caldă, festivă, generoasă.",
            "Intensă, romantică, cu personalitate.",
            "Senină, simplă, prietenoasă.",
            "Vibrantă, solară, plină de viață.",
            "Liniștită, poetică, contemplativă.",
        ],
    },
    {
        "text": "Ce calitate vrei să transmiți mai departe?",
        "options": [
            "Rafinament fără efort.",
            "Grijă autentică față de oameni.",
            "Curaj elegant.",
            "Bucurie sinceră.",
            "Încredere și entuziasm.",
            "Profundime și sensibilitate.",
        ],
    },
    {
        "text": "La finalul zilei, te simți împlinită când...",
        "options": [
            "ai păstrat echilibrul între tine și ceilalți.",
            "ai adus confort emoțional cuiva.",
            "ai dus la capăt ceva important.",
            "ai avut momente simple, dar frumoase.",
            "ai făcut pași mari cu energie bună.",
            "ai înțeles mai bine ce contează pentru tine.",
        ],
    },
]


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/generate-quiz")
async def generate_quiz():
    """Generate 7 unique quiz questions via Azure OpenAI.

    Each question has exactly 6 options. Option index maps to a flower:
      0=Lalea, 1=Bujor, 2=Trandafir, 3=Margareta, 4=Floarea-soarelui, 5=Floare albastră

    Uses randomized theme categories and creative angles each time to ensure
    every quiz session feels completely different.
    """
    client = get_azure_openai_client()
    if client is None:
        return {"questions": FALLBACK_QUESTIONS, "source": "fallback"}

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-5.2-chat")

    # ── Randomized topic pools for maximum variety ──
    THEME_POOLS = [
        # Daily life
        ["dimineața ta ideală", "rutina de seară", "un ritual zilnic preferat",
         "prima oră de la trezire", "cum arată pauza ta de prânz"],
        # Relationships
        ["cum arăți afecțiune", "ce faci pentru o prietenă tristă",
         "un cadou de suflet", "cum construiești o prietenie nouă",
         "cum reacționezi la un compliment neașteptat"],
        # Creativity / hobbies
        ["un weekend liber", "hobby-ul tău secret", "o activitate care te relaxează",
         "un proiect creativ de vis", "cum petreci o seară de ploaie"],
        # Challenges
        ["cum gestionezi un conflict", "o decizie dificilă",
         "o zi proastă la muncă", "un eșec pe care l-ai depășit",
         "când cineva te dezamăgește"],
        # Atmosphere / aesthetics
        ["camera ta ideală", "o destinație de vacanță",
         "cel mai frumos anotimp", "un parfum care te reprezintă",
         "culorile care te definesc"],
        # Values / inner world
        ["ce calitate prețuiești la tine", "o lecție de viață importantă",
         "ce vrei să transmiți lumii", "cum arată succesul pentru tine",
         "ce înseamnă curajul în viața ta"],
        # Social / fun
        ["rolul tău într-un grup", "cum organizezi o petrecere",
         "tipul de conversație care te energizează",
         "cum reacționezi la o surpriză", "primul lucru pe care-l spui la o întâlnire nouă"],
        # Imagination
        ["dacă ai fi un element al naturii", "un supraputere pe care ai alege-o",
         "un personaj din carte care te reprezintă",
         "o epocă istorică în care ai fi vrut să trăiești",
         "dacă ai putea avea o conversație cu oricine"],
    ]

    # Pick 7 random categories (can repeat if needed) and one topic from each
    chosen_categories = random.sample(THEME_POOLS, k=min(7, len(THEME_POOLS)))
    while len(chosen_categories) < 7:
        chosen_categories.append(random.choice(THEME_POOLS))
    chosen_topics = [random.choice(cat) for cat in chosen_categories]
    random.shuffle(chosen_topics)

    topics_line = "\n".join(f"  {i+1}. {t}" for i, t in enumerate(chosen_topics))

    # Pick a random creative angle
    angles = [
        "Formulează întrebările ca scenarii imaginare (ex: 'Dacă...', 'Imaginează-ți că...')",
        "Formulează întrebările ca alegeri practice de zi cu zi",
        "Formulează întrebările ca preferințe estetice și senzoriale",
        "Formulează întrebările ca reacții spontane la situații neașteptate",
        "Formulează întrebările ca metafore ușoare din natură sau artă",
        "Formulează întrebările ca mini-dileme amuzante și sincere",
    ]
    angle = random.choice(angles)

    system_prompt = (
        "Ești un creator de quiz-uri de personalitate unice, proaspete și surprinzătoare, "
        "în limba română, pentru femei. Fiecare quiz pe care-l creezi trebuie să fie COMPLET "
        "DIFERIT de orice ai generat înainte. Fii creativ, neașteptat, dar accesibil. "
        "Răspunsurile sunt scurte (max 10 cuvinte), clare, fără jargon sau clișee."
    )

    user_prompt = f"""Generează EXACT 7 întrebări UNICE pentru un quiz de personalitate.

IMPORTANT: Fiecare întrebare trebuie să fie pe un SUBIECT DIFERIT. Iată temele obligatorii:
{topics_line}

Stil creativ obligatoriu: {angle}

Fiecare întrebare are EXACT 6 variante de răspuns. Ordinea variantelor contează:
- Varianta 1: personalitate Lalea (eleganță, echilibru, rafinament, discretă)
- Varianta 2: personalitate Bujor (căldură, generozitate, empatie, grijă)  
- Varianta 3: personalitate Trandafir (forță, pasiune, determinare, curaj)
- Varianta 4: personalitate Margaretă (simplitate, sinceritate, bucurie, autentică)
- Varianta 5: personalitate Floarea-soarelui (optimism, curaj, energie, entuziasm)
- Varianta 6: personalitate Floare albastră (profunzime, sensibilitate, introspecție, creativitate)

Format JSON STRICT (fără alt text înainte sau după):
[
  {{
    "text": "Întrebarea aici?",
    "options": ["Lalea", "Bujor", "Trandafir", "Margaretă", "Floarea-soarelui", "Floare albastră"]
  }}
]

Reguli:
- Exact 7 obiecte
- Exact 6 stringuri în fiecare "options"  
- Fiecare răspuns max 10 cuvinte
- NU repeta nicio formulare clasică (ex: "cum începi dimineața")
- Fii SURPRINZĂTOR și ORIGINAL
- Răspunde DOAR cu JSON valid"""

    try:
        response = client.chat.completions.create(
            model=deployment,
            temperature=1.0,
            max_completion_tokens=1800,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        raw = (response.choices[0].message.content or "").strip()

        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("\n", 1)[-1]  # remove first line
            if raw.endswith("```"):
                raw = raw[:-3].strip()

        questions = json.loads(raw)

        # Validate structure
        if (
            not isinstance(questions, list)
            or len(questions) != 7
            or not all(
                isinstance(q, dict)
                and isinstance(q.get("text"), str)
                and isinstance(q.get("options"), list)
                and len(q["options"]) == 6
                and all(isinstance(o, str) for o in q["options"])
                for q in questions
            )
        ):
            return {"questions": FALLBACK_QUESTIONS, "source": "fallback"}

        # Shuffle option order per question while preserving index→flower mapping
        # (We DON'T shuffle — the order IS the mapping. But we shuffle question order.)
        random.shuffle(questions)

        return {"questions": questions, "source": "ai"}

    except Exception:
        return {"questions": FALLBACK_QUESTIONS, "source": "fallback"}


@app.post("/generate-illustration")
async def generate_illustration(
    photos: list[UploadFile] = File(...),
    flowers: list[str] = Form(...),
):
    """Accept 1-4 photos + flower types, generate a kawaii illustration via Azure OpenAI.

    Two-step process:
    1. Use GPT vision to describe each person's appearance from the photos.
    2. Use DALL-E 3 to generate the kawaii illustration from the description.
    """
    if len(photos) < 1 or len(photos) > 4:
        return JSONResponse({"error": "Încarcă între 1 și 4 fotografii."}, status_code=400)
    if len(photos) != len(flowers):
        return JSONResponse(
            {"error": "Fiecare fotografie are nevoie de o floare asociată."},
            status_code=400,
        )
    for f in flowers:
        if f not in FLOWER_LABELS:
            return JSONResponse({"error": f"Tip de floare invalid: {f}"}, status_code=400)

    client = get_azure_openai_client()
    if client is None:
        return JSONResponse({"error": "Serviciul AI nu este disponibil."}, status_code=503)

    chat_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-5.2-chat")
    dalle_deployment = os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3")

    # Read and encode each photo (cap at 5 MB each)
    photo_entries: list[dict] = []
    for photo, flower in zip(photos, flowers):
        raw = await photo.read()
        if len(raw) > 5 * 1024 * 1024:
            return JSONResponse(
                {"error": f"Fotografia '{photo.filename}' depășește 5 MB."},
                status_code=400,
            )
        b64 = base64.b64encode(raw).decode("utf-8")
        mime = photo.content_type or "image/jpeg"
        photo_entries.append({"b64": b64, "flower": flower, "mime": mime})

    # ── Step 1: Use GPT vision to describe each person ──
    flower_lines = []
    for i, entry in enumerate(photo_entries):
        label = FLOWER_LABELS[entry["flower"]]
        flower_lines.append(f"- Persoana {i + 1}: floarea {label}")

    vision_prompt = (
        f"Descrie detaliat aparența {'persoanei' if len(photo_entries) == 1 else 'fiecărei persoane'} "
        f"din {'această fotografie' if len(photo_entries) == 1 else 'aceste fotografii'}.\n\n"
        "Pentru fiecare persoană, menționează:\n"
        "- Culoarea și lungimea părului, stilul coafurii\n"
        "- Forma feței, culoarea pielii\n"
        "- Ochelari (dacă are)\n"
        "- Orice trăsătură distinctivă vizibilă\n"
        "- Vârsta aproximativă\n\n"
        "Răspunde concis, doar descrierile, fără introducere."
    )

    vision_content: list[dict] = [{"type": "text", "text": vision_prompt}]
    for entry in photo_entries:
        vision_content.append(
            {
                "type": "image_url",
                "image_url": {"url": f"data:{entry['mime']};base64,{entry['b64']}"},
            }
        )

    try:
        vision_response = client.chat.completions.create(
            model=chat_deployment,
            max_completion_tokens=600,
            messages=[
                {"role": "user", "content": vision_content},
            ],
        )
        description = (vision_response.choices[0].message.content or "").strip()
        if not description:
            return JSONResponse({"error": "Nu am putut analiza fotografiile."}, status_code=500)
    except Exception as exc:
        return JSONResponse(
            {"error": f"Analiza fotografiei a eșuat: {str(exc)}"},
            status_code=500,
        )

    # ── Step 2: Generate kawaii illustration with DALL-E 3 ──
    dalle_prompt = (
        "Create an adorable kawaii cartoon illustration in a cute Disney/Pixar pastel style.\n\n"
        f"The scene features {'a woman' if len(photo_entries) == 1 else f'{len(photo_entries)} women'} "
        "together in an enchanted garden full of flowers.\n\n"
        f"Description of {'the person' if len(photo_entries) == 1 else 'each person'}:\n"
        f"{description}\n\n"
        "Flower assignments:\n" + "\n".join(flower_lines) + "\n\n"
        "Rules:\n"
        "- Keep all distinctive features from the description (hair color, length, glasses, etc.)\n"
        "- Each person holds or is surrounded by their assigned flower\n"
        "- Style: cute, kawaii, soft pastels, warm, friendly\n"
        "- Background: enchanted garden with flowers and soft light\n"
        "- All people together in one scene\n"
        "- NO text overlays on the image."
    )

    try:
        image_response = client.images.generate(
            model=dalle_deployment,
            prompt=dalle_prompt,
            size="1024x1024",
            quality="hd",
            n=1,
            response_format="b64_json",
        )
        image_b64 = image_response.data[0].b64_json
        if not image_b64:
            return JSONResponse({"error": "Nu s-a generat nicio imagine."}, status_code=500)
        return {"image": image_b64}

    except Exception as exc:
        return JSONResponse(
            {"error": f"Generarea ilustrației a eșuat: {str(exc)}"},
            status_code=500,
        )


@app.post("/ai-message")
async def ai_message(body: AiMessageRequest):
    flower = body.flower.strip()
    if flower not in FLOWER_LABELS:
        return {"text": "Floare invalidă.", "source": "fallback"}

    flower_label = FLOWER_LABELS[flower]
    traits = sanitize_traits(body.traits)
    traits_line = ", ".join(traits) if traits else "fără indicii suplimentare"

    # Randomize the writing style for unique results every time
    styles = [
        "cald și poetic, ca o scrisoare de la o prietenă apropiată",
        "inspirațional și energic, ca un discurs motivațional delicat",
        "intim și reflectiv, ca o pagină de jurnal frumoasă",
        "jucăuș și sincer, ca o descriere făcută cu drag",
        "elegant și contemplativ, ca o poezie în proză",
        "direct și afectuos, ca un toast de suflet la o masă între prietene",
    ]
    style = random.choice(styles)

    # Randomize the focus angle
    angles = [
        "cum influențează ea relațiile cu ceilalți",
        "ce forță interioară ascunde",
        "cum se vede feminitatea ei în viața de zi cu zi",
        "ce o face unică în felul ei de a fi",
        "cum vede ea frumusețea în lume",
        "ce energie specială aduce în cameră",
    ]
    angle = random.choice(angles)

    system_prompt = (
        f"Scrii în română pentru femei. Tonul: {style}. "
        "Fără clișee, fără limbaj psihologic sau diagnostic. "
        "Fiecare text trebuie să fie UNIC — nu repeta formulări standard."
    )
    user_prompt = (
        f"Generează EXACT 4-5 propoziții despre semnificația florii de personalitate. "
        f'Textul trebuie să înceapă EXACT cu: „Faptul că floarea ta este {flower_label} spune despre tine că…" '
        f"Concentrează-te pe: {angle}. "
        f"Folosește ca indicii aceste trăsături: {traits_line}. "
        "Fiecare propoziție să aducă o idee nouă, nu parafraza aceleiași. "
        "Nu adăuga titlu, listă sau introducere suplimentară."
    )

    client = get_azure_openai_client()
    if client is None:
        return {"text": get_fallback(flower), "source": "fallback"}

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-5.2-chat")

    try:
        response = client.chat.completions.create(
            model=deployment,
            temperature=0.85,
            max_completion_tokens=300,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        text = (response.choices[0].message.content or "").strip()
        if not text:
            return {"text": get_fallback(flower), "source": "fallback"}
        return {"text": text, "source": "ai"}
    except Exception:
        return {"text": get_fallback(flower), "source": "fallback"}
