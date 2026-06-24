# The Edge — Cloudflare Worker

Three endpoints:
- `POST /api/chat` — Claude Sonnet 4.6 evaluates a founder's answer, returns JSON.
- `POST /api/save` — stores progress in KV, emails a resume link via Resend.
- `POST /api/complete` — renders Signal Map, emails it, stores the lead.

## Local dev (no Cloudflare/Resend setup yet)

You can run the Worker locally to test against real Claude without deploying.

1. Install:
   ```bash
   npm install
   ```

2. Create `.dev.vars` (NOT `.env.local`) in this folder:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   RESEND_API_KEY=re_...
   ```
   Resend key can be a dummy string if you're not testing emails yet.

3. Run:
   ```bash
   npm run dev
   ```
   Serves at http://127.0.0.1:8787

4. In the frontend's `.env.local`, set:
   ```
   VITE_USE_MOCK=false
   VITE_API_BASE=http://127.0.0.1:8787
   ```
   Restart `npm run dev` in the app folder.

## Deploy to Cloudflare (later)

1. `npx wrangler login`
2. `npx wrangler kv namespace create SESSIONS` → paste id into wrangler.toml
3. `npx wrangler secret put ANTHROPIC_API_KEY`
4. `npx wrangler secret put RESEND_API_KEY`
5. Update vars in wrangler.toml (ALLOWED_ORIGIN, APP_URL, FROM_EMAIL)
6. `npm run deploy`

## Resend setup (when ready)

You need a verified sending domain in Resend before emails will send. Verify `galvanite.io` (or whatever domain you'll send from) via DNS records in their dashboard.
