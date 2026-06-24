# The Edge — Frontend

Dark immersive React app, Galvanite-aligned design.

## Run locally (mock mode, no backend needed)

```bash
npm install
# Edit .env.local: set VITE_USE_MOCK=true
npm run dev
```

Open http://localhost:5173

## Run locally with the Worker

1. Start the worker (see `../the-edge-worker/`)
2. In `.env.local`: `VITE_USE_MOCK=false` and `VITE_API_BASE=http://127.0.0.1:8787`
3. `npm run dev`

## Asset notes

The following assets are referenced but not included in this zip:
- `public/logo.svg` — Galvanite "The Edge" wordmark
- `public/favicon.png` — Galvanite mark
- `public/fonts/DMSans-VariableFont_opsz_wght.ttf`
- `public/fonts/NORDTSLIM-SEMILIGHT.OTF`

Drop these into `public/` (and `public/fonts/`) before running.

## Project structure

```
src/
├── App.jsx                       state coordinator + USE_MOCK toggle
├── components/
│   ├── ConversationPane.jsx      left/right side, conversation
│   ├── SignalSummary.jsx         sidebar with locked answers
│   ├── MessageBubble.jsx
│   ├── TypingIndicator.jsx
│   ├── InputBar.jsx
│   ├── ClarityMeter.jsx
│   ├── SaveProgressModal.jsx
│   ├── OneLinerSelect.jsx
│   └── Intro.jsx
├── lib/
│   ├── steps.js                  10-step schema
│   ├── mockChat.js               heuristic backend
│   ├── api.js                    real Worker client
│   └── storage.js                localStorage helpers
└── styles/
    ├── globals.css
    └── components.css
```
