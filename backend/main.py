import os
import json
import base64
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
    """
    client = get_azure_openai_client()
    if client is None:
        return {"questions": FALLBACK_QUESTIONS, "source": "fallback"}

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")

    system_prompt = (
        "Ești un generator de quiz-uri de personalitate pentru femei, în limba română. "
        "Generezi întrebări creative, variate și captivante. "
        "Răspunsurile sunt scurte (max 10 cuvinte), clare, fără jargon."
    )

    user_prompt = """Generează EXACT 7 întrebări pentru un quiz de personalitate destinat femeilor.

Fiecare întrebare are EXACT 6 variante de răspuns. Ordinea variantelor contează:
- Varianta 1: potrivită pentru personalitate de tip Lalea (eleganță, echilibru, rafinament)
- Varianta 2: potrivită pentru personalitate de tip Bujor (căldură, generozitate, empatie)
- Varianta 3: potrivită pentru personalitate de tip Trandafir (forță, pasiune, determinare)
- Varianta 4: potrivită pentru personalitate de tip Margaretă (simplitate, sinceritate, bucurie)
- Varianta 5: potrivită pentru personalitate de tip Floarea-soarelui (optimism, curaj, energie)
- Varianta 6: potrivită pentru personalitate de tip Floare albastră (profunzime, sensibilitate, introspecție)

Respectă STRICT acest format JSON (fără alt text înainte sau după):
[
  {
    "text": "Întrebarea aici?",
    "options": ["Răspuns Lalea", "Răspuns Bujor", "Răspuns Trandafir", "Răspuns Margaretă", "Răspuns Floarea-soarelui", "Răspuns Floare albastră"]
  }
]

Reguli:
- Exact 7 obiecte în array
- Exact 6 stringuri în fiecare "options"
- Întrebările să fie variate: despre dimineți, relații, hobby-uri, provocări, atmosferă, valori, seară
- Nu repeta întrebări identice sau foarte similare
- Fiecare răspuns max 10 cuvinte
- Răspunde DOAR cu JSON valid, nimic altceva"""

    try:
        response = client.chat.completions.create(
            model=deployment,
            temperature=0.9,
            max_tokens=1500,
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

        return {"questions": questions, "source": "ai"}

    except Exception:
        return {"questions": FALLBACK_QUESTIONS, "source": "fallback"}


@app.post("/generate-illustration")
async def generate_illustration(
    photos: list[UploadFile] = File(...),
    flowers: list[str] = Form(...),
):
    """Accept 1-4 photos + flower types, generate a kawaii illustration via Azure OpenAI."""
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

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")

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

    # Build flower assignment text
    flower_lines = []
    for i, entry in enumerate(photo_entries):
        label = FLOWER_LABELS[entry["flower"]]
        flower_lines.append(f"- Persoana {i + 1}: floarea {label}")

    prompt = (
        f"Analizează {'această fotografie' if len(photo_entries) == 1 else 'aceste fotografii'} "
        f"și generează o ilustrație adorabilă, în stil cartoon kawaii, "
        f"cu {'persoana' if len(photo_entries) == 1 else 'persoanele'} din "
        f"{'fotografie' if len(photo_entries) == 1 else 'fotografii'} "
        f"într-o grădină fermecată plină de flori.\n\n"
        f"Asocierile cu flori:\n" + "\n".join(flower_lines) + "\n\n"
        "Reguli importante:\n"
        "- Păstrează trăsăturile distinctive ale fiecărei persoane (culoarea părului, "
        "forma feței, ochelari dacă au, lungimea părului, etc.)\n"
        "- Fiecare persoană ține sau este înconjurată de floarea ei\n"
        "- Stil: cute, kawaii, pasteluri, cald, prietenos, Disney/Pixar\n"
        "- Fundal: grădină fermecată cu flori\n"
        "- Toate persoanele sunt împreună într-o singură scenă\n"
        "- Generează DOAR imaginea, fără text suprapus."
    )

    # Build Responses API input with photos
    input_content: list[dict] = [{"type": "input_text", "text": prompt}]
    for entry in photo_entries:
        input_content.append(
            {
                "type": "input_image",
                "image_url": f"data:{entry['mime']};base64,{entry['b64']}",
            }
        )

    try:
        response = client.responses.create(
            model=deployment,
            input=[{"role": "user", "content": input_content}],
            tools=[{"type": "image_generation", "size": "1024x1024", "quality": "high"}],
        )

        # Extract the generated image from the response output
        for item in response.output:
            if item.type == "image_generation_call":
                return {"image": item.result}

        return JSONResponse({"error": "Nu s-a generat nicio imagine."}, status_code=500)

    except Exception as exc:
        return JSONResponse(
            {"error": f"Generarea a eșuat: {str(exc)}"},
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

    system_prompt = (
        "Scrii în română pentru femei, poetic dar clar, fără metafore obscure, "
        "fără clișee, fără limbaj psihologic sau diagnostic."
    )
    user_prompt = (
        f"Generează EXACT 4-5 propoziții despre semnificația unei flori de personalitate. "
        f'Textul trebuie să înceapă EXACT cu: „Faptul că floarea ta este {flower_label} spune despre tine că…" '
        f"Folosește ca indicii aceste trăsături: {traits_line}. "
        "Nu adăuga titlu, listă sau introducere suplimentară."
    )

    client = get_azure_openai_client()
    if client is None:
        return {"text": get_fallback(flower), "source": "fallback"}

    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini")

    try:
        response = client.chat.completions.create(
            model=deployment,
            temperature=0.6,
            max_tokens=260,
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
