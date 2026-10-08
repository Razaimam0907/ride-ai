# Chalo Rides
1. Install Node 18+.
2. Get an API key at console.anthropic.com.
3. Mac/Linux: `ANTHROPIC_API_KEY=sk-... node server.js`
   Windows (PowerShell): `$env:ANTHROPIC_API_KEY="sk-..."; node server.js`
4. Open http://localhost:3000
Never put the API key in script.js or ai.js: anyone could steal it. Keep it only in server.js / env vars.
