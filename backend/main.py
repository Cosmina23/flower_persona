import os
import json
import base64
import random
import traceback
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from openai import AsyncAzureOpenAI

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


def get_azure_openai_client() -> AsyncAzureOpenAI | None:
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    if not api_key or not endpoint:
        return None
    return AsyncAzureOpenAI(
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
    has_key = bool(os.getenv("AZURE_OPENAI_API_KEY"))
    has_endpoint = bool(os.getenv("AZURE_OPENAI_ENDPOINT"))
    return {
        "status": "ok",
        "ai_configured": has_key and has_endpoint,
        "has_api_key": has_key,
        "has_endpoint": has_endpoint,
    }


# ── Parse Question.md into a pool of 30 questions ──
import re as _re
import pathlib as _pathlib

def _load_questions_from_md() -> list[dict]:
    """Parse Question.md (30 questions, a-f options) and return list of {text, options}.

    Option mapping: a=Lalea(0), b=Bujor(1), c=Trandafir(2),
                    d=Margareta(3), e=Floarea-soarelui(4), f=Floare albastră(5)
    """
    # Try multiple locations
    for candidate in [
        _pathlib.Path(__file__).parent / "Question.md",
        _pathlib.Path(__file__).parent.parent / "Question.md",
        _pathlib.Path("/Question.md"),
    ]:
        if candidate.exists():
            md_path = candidate
            break
    else:
        print("[QUIZ] Question.md not found in any location", flush=True)
        return []

    print(f"[QUIZ] Loading questions from {md_path}", flush=True)
    content = md_path.read_text(encoding="utf-8")
    questions: list[dict] = []

    # Split by numbered question pattern: "N. question text"
    blocks = _re.split(r'\n(?=\d+\.\s)', content)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        # Match "N. question text"
        header_match = _re.match(r'^(\d+)\.\s+(.+)', block)
        if not header_match:
            continue
        question_text = header_match.group(2).strip()
        # Extract a) through f) options
        options: list[str] = []
        for letter in ['a', 'b', 'c', 'd', 'e', 'f']:
            m = _re.search(rf'^{letter}\)\s+(.+)$', block, _re.MULTILINE)
            if m:
                options.append(m.group(1).strip())
        if question_text and len(options) == 6:
            questions.append({"text": question_text, "options": options})

    print(f"[QUIZ] Loaded {len(questions)} questions from Question.md", flush=True)
    return questions

ALL_QUESTIONS_POOL = _load_questions_from_md() or FALLBACK_QUESTIONS


@app.get("/generate-quiz")
async def generate_quiz():
    """Return 7 random questions from the static pool of 40 questions.

    Each question has exactly 6 options. Option index maps to a flower:
      0=Lalea, 1=Bujor, 2=Trandafir, 3=Margareta, 4=Floarea-soarelui, 5=Floare albastră

    Questions are randomly selected without repeats.
    """
    pool = list(ALL_QUESTIONS_POOL)
    selected = random.sample(pool, k=min(7, len(pool)))
    random.shuffle(selected)
    return {"questions": selected, "source": "static"}


@app.post("/generate-illustration")
async def generate_illustration(
    photo: UploadFile = File(...),
    flower: str | None = Form(None),
):
    """Accept a single photo + optional flower. AI detects how many people
    are in it, describes each person, then generates a semi-realistic
    watercolor illustration via DALL-E 3.
    """
    client = get_azure_openai_client()
    if client is None:
        return JSONResponse(
            {"error": "Serviciul AI nu este disponibil. Verifică variabilele de mediu AZURE_OPENAI_API_KEY și AZURE_OPENAI_ENDPOINT."},
            status_code=503,
        )

    chat_deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-5.2-chat")
    dalle_deployment = os.getenv("AZURE_DALLE_DEPLOYMENT_NAME", "dall-e-3")

    # Read and encode the photo (cap at 5 MB)
    raw = await photo.read()
    if len(raw) > 5 * 1024 * 1024:
        return JSONResponse(
            {"error": f"Fotografia '{photo.filename}' depășește 5 MB."},
            status_code=400,
        )
    b64 = base64.b64encode(raw).decode("utf-8")
    mime = photo.content_type or "image/jpeg"

    # ── Step 1: GPT vision — detect people count & describe each person ──
    vision_prompt = (
        "Analizează această fotografie cu atenție.\n\n"
        "1. Câte persoane sunt în fotografie? (returnează un număr exact)\n"
        "2. Pentru FIECARE persoană detectată, descrie DOAR aceste trăsături vizuale:\n"
        "   - Poziția în fotografie (stânga, centru, dreapta etc.)\n"
        "   - Culoarea și lungimea părului, stilul coafurii\n"
        "   - Ochelari (dacă are — forma: rotunzi, pătrați etc.)\n"
        "   - Culoarea și tipul hainelor vizibile (rochie, bluză, etc.)\n"
        "   - Accesorii vizibile (cercei, colier, bentiță etc.)\n\n"
        "IMPORTANT: Descrie DOAR haine, păr, ochelari și accesorii.\n"
        "NU descrie trăsături faciale, vârstă, tonul pielii sau etnie.\n"
        "Scopul este să creezi un personaj de desen animat stilizat pe baza ținutei și stilului.\n\n"
        "Răspunde STRICT în acest format JSON (fără alt text):\n"
        '{\n'
        '  "people_count": <număr>,\n'
        '  "descriptions": [\n'
        '    {"position": "...", "appearance": "descriere stilistică persoana 1"},\n'
        '    {"position": "...", "appearance": "descriere stilistică persoana 2"}\n'
        '  ]\n'
        '}\n\n'
        "Dacă nu este nicio persoană în fotografie, returnează people_count: 0 și descriptions: []."
    )

    vision_content: list[dict] = [
        {"type": "text", "text": vision_prompt},
        {
            "type": "image_url",
            "image_url": {"url": f"data:{mime};base64,{b64}"},
        },
    ]

    try:
        vision_response = await client.chat.completions.create(
            model=chat_deployment,
            max_completion_tokens=2000,
            messages=[
                {"role": "user", "content": vision_content},
            ],
        )
        vision_raw = (vision_response.choices[0].message.content or "").strip()
        if not vision_raw:
            return JSONResponse({"error": "Nu am putut analiza fotografia."}, status_code=500)
    except Exception as exc:
        return JSONResponse(
            {"error": f"Analiza fotografiei a eșuat: {str(exc)}"},
            status_code=500,
        )

    # Parse the structured vision response
    try:
        # Strip markdown code fences if present
        cleaned = vision_raw
        if cleaned.startswith("```"):
            cleaned = cleaned.split("\n", 1)[-1]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3].strip()

        analysis = json.loads(cleaned)
        people_count = int(analysis.get("people_count", 0))
        descriptions = analysis.get("descriptions", [])

        if people_count == 0 or not descriptions:
            return JSONResponse(
                {"error": "Nu am detectat nicio persoană în fotografie. Încearcă cu o altă fotografie."},
                status_code=400,
            )

        # Cap at reasonable max
        if people_count > 8:
            people_count = 8
            descriptions = descriptions[:8]

    except (json.JSONDecodeError, ValueError, TypeError):
        # Fallback: use the raw text as a description, assume 1 person
        people_count = 1
        descriptions = [{"position": "centru", "appearance": vision_raw}]

    # Build a human-readable description block for DALL-E
    FLOWER_TO_DALLE = {
        "lalea": "tulips",
        "bujor": "peonies",
        "trandafir": "roses",
        "margareta": "daisies",
        "floarea_soarelui": "sunflowers",
        "floare_albastra": "blue cornflowers",
    }
    flowers_pool = ["tulips", "peonies", "roses", "daisies", "sunflowers", "blue cornflowers"]
    selected_flower_en = FLOWER_TO_DALLE.get(flower, "") if flower else ""

    desc_lines = []
    for i, d in enumerate(descriptions):
        appearance = d.get("appearance", "") if isinstance(d, dict) else str(d)
        position = d.get("position", "") if isinstance(d, dict) else ""
        flower_name = selected_flower_en if selected_flower_en else flowers_pool[i % len(flowers_pool)]
        desc_lines.append(
            f"- Character {i + 1} ({position}): outfit & style: {appearance} — surrounded by {flower_name}"
        )

    people_word = "a character" if people_count == 1 else f"{people_count} characters"

    # ── Step 2: Generate cartoon-style illustration with DALL-E 3 ──
    dalle_prompt = (
        "Create a charming cartoon illustration in a whimsical, stylized storybook style — "
        "colorful, playful, with clean lines, cel-shading and a warm pastel palette.\n\n"
        f"The scene features EXACTLY {people_word} as cute cartoon characters in a magical flower garden.\n\n"
        "Character descriptions (outfit & style ONLY — do NOT depict any real person):\n"
        + "\n".join(desc_lines) + "\n\n"
        "Rules:\n"
        "- IMPORTANT: Draw EXACTLY " + str(people_count) + f" cartoon {'character' if people_count == 1 else 'characters'}, no more, no less\n"
        "- This is a FICTIONAL cartoon, NOT a portrait of any real person\n"
        "- Style: cute cartoon / anime-inspired, big expressive eyes, simplified features\n"
        "- Match hair style, hair color, glasses and clothing colors from the description\n"
        "- Each character holds or is surrounded by their assigned flowers\n"
        "- Background: magical storybook garden with flowers, butterflies and soft light\n"
        "- All characters together in one scene, matching their described positions\n"
        "- Warm pastel tones, playful and cheerful mood\n"
        "- NO text overlays on the image."
    )

    try:
        image_response = await client.images.generate(
            model=dalle_deployment,
            prompt=dalle_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
            response_format="b64_json",
        )
        image_b64 = image_response.data[0].b64_json
        if not image_b64:
            return JSONResponse({"error": "Nu s-a generat nicio imagine."}, status_code=500)
        return {
            "image": image_b64,
            "people_count": people_count,
            "descriptions": descriptions,
        }

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
        print(f"[AI-MESSAGE] Calling AI for flower={flower}, deployment={deployment}", flush=True)
        response = await client.chat.completions.create(
            model=deployment,
            temperature=1.0,
            max_completion_tokens=2000,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        )
        finish_reason = response.choices[0].finish_reason if response.choices else "no_choices"
        text = (response.choices[0].message.content or "").strip()
        print(f"[AI-MESSAGE] finish_reason={finish_reason}, text_len={len(text)}", flush=True)
        if not text:
            return {"text": get_fallback(flower), "source": "fallback"}
        return {"text": text, "source": "ai"}
    except Exception as exc:
        print(f"[AI-MESSAGE ERROR] {type(exc).__name__}: {exc}", flush=True)
        return {"text": get_fallback(flower), "source": "fallback"}
