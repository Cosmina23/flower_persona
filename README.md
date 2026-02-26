# Quiz de Personalitate - Floare

A personality quiz app for a women's workshop event. Users answer 7 questions and get assigned a flower personality, with an AI-generated personalized description.

## Architecture

```
flower_persona/
├── backend/          # FastAPI (Python) — AI message endpoint
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/         # React + Vite — Quiz UI
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env
├── docker-compose.yml
├── deploy.sh         # Azure Container Apps deploy (bash)
├── deploy.ps1        # Azure Container Apps deploy (PowerShell)
├── public/           # (legacy) Original vanilla JS frontend
├── server.js         # (legacy) Original Express backend
└── api/              # (legacy) Vercel serverless functions
```

## Quick Start (Docker Compose)

1. **Configure backend credentials** — edit `backend/.env`:
   ```
   AZURE_OPENAI_API_KEY=your-key
   AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o-mini
   ```

2. **Run locally:**
   ```bash
   docker-compose up --build
   ```

3. **Open** http://localhost:3000

## Deploy to Azure Container Apps

### Prerequisites
- Azure CLI (`az`) installed and logged in (`az login`)
- Docker installed

### Deploy

**Bash (Linux/macOS/WSL):**
```bash
chmod +x deploy.sh
./deploy.sh
```

**PowerShell (Windows):**
```powershell
.\deploy.ps1
```

The script will:
1. Create a Resource Group + Azure Container Registry
2. Build & push both Docker images
3. Deploy backend as a Container App
4. Build frontend with the backend URL baked in
5. Deploy frontend as a public Container App
6. Print the live URL

### Tear down
```bash
az group delete --name flower-quiz-rg --yes --no-wait
```

## Backend API

- `GET /health` — Health check
- `POST /ai-message` — Generate flower personality text

  ```json
  { "flower": "lalea", "traits": ["eleganță", "echilibru"] }
  ```

  Returns:
  ```json
  { "text": "...", "source": "ai" }
  ```

## Fallback

- If Azure OpenAI credentials are missing or the API fails, the backend returns pre-written Romanian fallback text per flower.
- If the backend is unreachable entirely, the frontend displays its own local fallback text.

## License

MIT