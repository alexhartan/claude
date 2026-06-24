# Deploying The Edge

Everything here is run from your own machine (Cloudflare auth, DNS, and Resend
verification can't be done from inside a sandbox). Follow top to bottom and the
tool goes live at **edge.galvanite.io**.

## 0. Prerequisites

- A Cloudflare account (free tier is fine).
- The `galvanite.io` domain on Cloudflare DNS (or access to wherever its DNS lives).
- A Resend account.
- An Anthropic API key.
- Node 18+ and `npm` locally.
- The three brand assets dropped into `the-edge-app/public/`: `logo.svg`,
  `favicon.png`, and the fonts under `public/fonts/` (`DMSans-VariableFont_opsz_wght.ttf`,
  `NORDTSLIM-SEMILIGHT.OTF`). The build warns but does not fail without them.

---

## 1. Resend: verify the sending domain

1. Resend dashboard → **Domains** → add `galvanite.io`.
2. Add the DKIM/SPF/DMARC records Resend gives you to Cloudflare DNS.
3. Wait for verification (usually minutes).
4. Create an API key (**API Keys → Create**). Save it for step 3.

`FROM_EMAIL` in `wrangler.toml` is already `The Edge <edge@galvanite.io>` — that
address must be on the verified domain. `NOTIFY_EMAIL` (lead alerts to you) is set
to `alex@galvanite.io`; change it in `wrangler.toml` if you want a different inbox.

---

## 2. Worker: KV namespace

```bash
cd the-edge-worker
npm install
wrangler login
wrangler kv namespace create SESSIONS
```

Copy the printed `id` into `wrangler.toml`, replacing `REPLACE_WITH_YOUR_KV_NAMESPACE_ID`.

---

## 3. Worker: secrets

```bash
wrangler secret put ANTHROPIC_API_KEY   # paste your sk-ant-... key
wrangler secret put RESEND_API_KEY       # paste your re_... key
```

(For local `wrangler dev`, put these in `the-edge-worker/.dev.vars` instead — that
file is gitignored. Never commit keys.)

---

## 4. Worker: production vars + deploy

In `wrangler.toml` set:

```toml
ALLOWED_ORIGIN = "https://edge.galvanite.io"
APP_URL        = "https://edge.galvanite.io"
```

`APP_URL` is what the save-progress email's resume link is built from, so it must
match the live frontend origin or cross-device resume breaks.

```bash
wrangler deploy
```

Note the deployed Worker URL (e.g. `https://the-edge-worker.<subdomain>.workers.dev`).
You can either use that as the API base, or put the Worker behind a route like
`edge.galvanite.io/api/*` (cleaner — see step 6).

---

## 5. Frontend: build + deploy to Pages

Set the API base the frontend calls. Edit `the-edge-app/.env.local` (or set the
var in the Pages build settings):

```
VITE_USE_MOCK=false
VITE_API_BASE=https://the-edge-worker.<subdomain>.workers.dev
```

(If you route the Worker under `edge.galvanite.io/api/*` in step 6, set
`VITE_API_BASE=https://edge.galvanite.io` instead.)

```bash
cd ../the-edge-app
npm install
npm run build      # outputs dist/
```

Deploy `dist/` to Cloudflare Pages:

```bash
wrangler pages deploy dist --project-name the-edge
```

Or connect the repo in the Cloudflare dashboard with build command `npm run build`
and output dir `dist`.

---

## 6. DNS: point edge.galvanite.io at the app

1. Cloudflare → Pages project → **Custom domains** → add `edge.galvanite.io`.
   Cloudflare creates the CNAME automatically if the domain is on its DNS.
2. (Optional, cleaner API) Worker → **Settings → Triggers → Routes** → add
   `edge.galvanite.io/api/*`. Then the frontend and API share one origin, you can
   drop `VITE_API_BASE` back to same-origin, and `ALLOWED_ORIGIN` can stay
   `https://edge.galvanite.io`.

---

## 7. Smoke test (production)

1. Open `https://edge.galvanite.io`, clear localStorage, run a few steps.
2. Save progress → check the email arrives and the **Continue** link opens
   `edge.galvanite.io/?resume=<id>` and restores state (try a different device).
3. Finish the exercise → check the Signal Map email lands, and that a lead
   notification hits `NOTIFY_EMAIL`.
4. In Cloudflare KV, confirm `session:*` and `lead:*` keys exist.

---

## Keeping the prompt in sync

`the-edge-worker/src/systemPrompt.js` is a compacted copy of the skill in
`the-edge/`. When you tune one, mirror the change in the other. The skill is the
source of truth for voice and per-step pass criteria.
