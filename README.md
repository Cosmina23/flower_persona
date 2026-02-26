# Quiz de Personalitate - Floare (local + AI opțional)

Aplicația decide floarea strict local (scor + stoc în `localStorage`). AI doar descrie floarea finală.

## Rulare

1. Instalează dependențele:

   ```bash
   npm install
   ```

2. Setează cheia OpenAI în environment (`OPENAI_API_KEY`):

   PowerShell (sesiunea curentă):

   ```powershell
   $env:OPENAI_API_KEY="cheia_ta_aici"
   ```

   CMD (sesiunea curentă):

   ```cmd
   set OPENAI_API_KEY=cheia_ta_aici
   ```

3. Pornește backend-ul local:

   ```bash
   npm start
   ```

4. Deschide frontend-ul:

   - fie direct `public/index.html`
   - fie cu server static local (ex. `npx --yes serve public`)

## Endpoint backend

- `POST http://localhost:3000/ai-message`
- Input:

  ```json
  { "flower": "lalea", "traits": ["eleganță", "echilibru"] }
  ```

- Output:

  ```json
  { "text": "...", "source": "ai" }
  ```

  sau

  ```json
  { "text": "...", "source": "fallback" }
  ```

## Fallback offline

- Dacă `OPENAI_API_KEY` lipsește sau AI nu răspunde, backend-ul returnează text fallback per floare.
- Dacă backend-ul nu este disponibil deloc, frontend-ul afișează fallback local și mesajul: `AI indisponibil, am afișat varianta offline.`

## License

MIT