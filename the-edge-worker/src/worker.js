// The Edge — Cloudflare Worker

import { SYSTEM_BASE, buildStepSystem } from './systemPrompt.js';
import { renderSignalMapEmail, renderSaveProgressEmail, renderLeadNotificationEmail } from './email.js';

const MODEL = 'claude-opus-4-8';

function corsHeaders(env) {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data, env, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(env) });
    }
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/chat' && request.method === 'POST') return await handleChat(request, env);
      if (url.pathname === '/api/oneliners' && request.method === 'POST') return await handleOneLiners(request, env);
      if (url.pathname === '/api/save' && request.method === 'POST') return await handleSave(request, env);
      if (url.pathname === '/api/complete' && request.method === 'POST') return await handleComplete(request, env);
      if (url.pathname === '/api/session' && request.method === 'GET') return await handleSession(url, env);
      return json({ error: 'Not found' }, env, 404);
    } catch (err) {
      return json({ error: 'Server error', detail: String(err) }, env, 500);
    }
  },
};

// Anthropic requires the message list to start with a `user` turn and to
// alternate roles. The client seeds the convo with an assistant opening line
// and shows back-to-back assistant messages when a step locks, so normalize:
// drop empties, merge consecutive same-role turns, trim leading assistant turns.
// Step 00 now captures the business name plus what they sell / what's special,
// so answers['00'] can be a full sentence. Derive a short label (first clause)
// for places that need a token: the email subject and the one-liner prompt.
function shortName(v) {
  return String(v || '').split(/[.\n!?]/)[0].trim().slice(0, 80);
}

function buildMessages(history, userMessage) {
  const raw = [...history, { role: 'user', content: userMessage }];
  const cleaned = [];
  for (const m of raw) {
    if (!m || !m.content) continue;
    const role = m.role === 'assistant' ? 'assistant' : 'user';
    const last = cleaned[cleaned.length - 1];
    if (last && last.role === role) {
      last.content += '\n\n' + m.content;
    } else {
      cleaned.push({ role, content: m.content });
    }
  }
  while (cleaned.length && cleaned[0].role !== 'user') cleaned.shift();
  return cleaned;
}

// Coarse per-IP rate limit backed by KV. Guards the endpoints that call the
// paid Anthropic API so a bot or bored visitor can't run up the bill. Fixed
// window; eventual consistency is fine for abuse protection. Fails open if KV
// is unavailable so a storage blip never blocks real founders.
async function rateLimited(env, request, name, limit, windowSec) {
  if (!env.SESSIONS) return false;
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const bucket = Math.floor(Date.now() / 1000 / windowSec);
  const key = `rl:${name}:${ip}:${bucket}`;
  try {
    const current = parseInt((await env.SESSIONS.get(key)) || '0', 10);
    if (current >= limit) return true;
    await env.SESSIONS.put(key, String(current + 1), { expirationTtl: windowSec * 2 });
    return false;
  } catch (err) {
    console.error('Rate limit check failed:', String(err));
    return false;
  }
}

const RATE_LIMIT_MESSAGE = 'Too many requests. Please slow down and try again in a moment.';

// Daily caps sized to hold worst-case Anthropic spend under ~$1/IP/day on Opus 4.8
// ($5/$25 per MTok): a chat call is ~1.7K in + ~150 out ≈ $0.012, a one-liner call
// ~0.9K in + ~350 out ≈ $0.013. 75 chats ($0.90) + 6 one-liners ($0.08) ≈ $0.98.
// A real founder uses ~19 calls per completed session, so honest use never hits this.
async function handleChat(request, env) {
  if (await rateLimited(env, request, 'chat', 40, 60) ||
      await rateLimited(env, request, 'chat-day', 75, 86400)) {
    return json({ error: RATE_LIMIT_MESSAGE }, env, 429);
  }

  const { userMessage, currentStepId, pushbackCount = 0, history = [] } = await request.json();
  if (!userMessage || !currentStepId) return json({ error: 'Missing userMessage or currentStepId' }, env, 400);

  const system = [
    { type: 'text', text: SYSTEM_BASE, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: buildStepSystem(currentStepId, pushbackCount) },
  ];

  const messages = buildMessages(history.slice(-6), userMessage);

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': (env.ANTHROPIC_API_KEY || '').trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages }),
  });

  if (!res.ok) {
    const detail = await res.text();
    const requestId = res.headers.get('request-id') || res.headers.get('x-request-id') || '';
    console.error('Anthropic call failed', res.status, 'req', requestId, 'detail', detail);
    return json({ error: 'LLM call failed', status: res.status, requestId, detail }, env, 502);
  }

  const data = await res.json();
  const raw = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();

  let parsed;
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    parsed = JSON.parse(clean);
  } catch (e) {
    parsed = {
      assistant_message: raw || 'Could you say a bit more about that?',
      step_status: 'in_progress',
      captured_answer: null,
    };
  }

  return json({
    assistant_message: parsed.assistant_message,
    step_status: parsed.step_status === 'locked' ? 'locked' : 'in_progress',
    captured_answer: parsed.captured_answer ?? null,
    pushback_count: parsed.step_status === 'locked' ? pushbackCount : pushbackCount + 1,
  }, env);
}

// Fixed presentation order for the three one-liner drafts. Labels and use-cases
// are owned here (not by the model) so the UI stays consistent; the model only
// writes the polished `text` for each style.
const ONELINER_STYLES = [
  { label: 'Outcome-led', use: 'Best for homepage hero',
    brief: 'Lead with the concrete outcome/transformation the user gets. Benefit-first, confident, no jargon.' },
  { label: 'Obstacle-led', use: 'Best for sales decks and outbound',
    brief: 'Open with the user and the struggle they feel, then how the product resolves it.' },
  { label: 'Belief-led', use: 'Best for thought leadership and founder posts',
    brief: 'Open with the underlying belief / just cause, then tie the product to it.' },
];

async function handleOneLiners(request, env) {
  if (await rateLimited(env, request, 'oneliners', 15, 60) ||
      await rateLimited(env, request, 'oneliners-day', 6, 86400)) {
    return json({ error: RATE_LIMIT_MESSAGE }, env, 429);
  }

  const { answers = {} } = await request.json();
  const product = shortName(answers['00']) || 'the product';

  const brief = [
    ['Business', answers['00']],
    ['User', answers['01']],
    ['Problem (surface)', answers['02a']],
    ['Frustration (how it feels)', answers['02b']],
    ['Belief / why it matters', answers['02c']],
    ['Empathy', answers['03a']],
    ['Authority', answers['03b']],
    ['Process', answers['04']],
    ['Primary CTA', answers['05a']],
    ['Secondary CTA', answers['05b']],
    ['Cost of inaction', answers['06']],
    ['Transformation', answers['07']],
  ].filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n');

  const styleSpec = ONELINER_STYLES
    .map((s, i) => `${i + 1}. ${s.label} (${s.use}) — ${s.brief}`)
    .join('\n');

  const system = `You are a sharp brand strategist who writes positioning one-liners.
You will receive a founder's "Signal Map" — their answers about their product, user, and story.
Write three one-liners for ${product}, one in each style below, in this exact order:
${styleSpec}

Rules:
- Polish for clarity and brevity. Do NOT just stitch the answers together verbatim — rewrite them into clean, natural marketing copy.
- Each one-liner is one or two short sentences, ~25 words max.
- Be concrete and grounded ONLY in the Signal Map. Do not invent facts or features.
- No placeholder brackets, no labels, no quotation marks around the lines.
- Plain, human language. Avoid hype words like "revolutionary", "seamless", "game-changing".

Respond with ONLY a JSON array of exactly three strings, in the order above. Example: ["...", "...", "..."]`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': (env.ANTHROPIC_API_KEY || '').trim(),
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system,
      messages: [{ role: 'user', content: `Signal Map:\n\n${brief}` }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('One-liner call failed', res.status, detail);
    return json({ error: 'LLM call failed', status: res.status }, env, 502);
  }

  const data = await res.json();
  const raw = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();

  let texts;
  try {
    const clean = raw.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    texts = JSON.parse(clean);
  } catch (e) {
    // Salvage a bare array if the model wrapped it in prose.
    const m = raw.match(/\[[\s\S]*\]/);
    texts = m ? JSON.parse(m[0]) : null;
  }

  if (!Array.isArray(texts) || texts.length < ONELINER_STYLES.length) {
    return json({ error: 'Could not parse one-liners' }, env, 502);
  }

  const variants = ONELINER_STYLES.map((s, i) => ({
    label: s.label,
    use: s.use,
    text: String(texts[i] || '').trim(),
  }));

  return json({ variants }, env);
}

async function handleSave(request, env) {
  const { email, state } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, env, 400);
  }

  const sessionId = crypto.randomUUID();
  if (env.SESSIONS) {
    await env.SESSIONS.put(`session:${sessionId}`,
      JSON.stringify({ email, state, savedAt: Date.now() }),
      { expirationTtl: 60 * 60 * 24 * 30 });
    await env.SESSIONS.put(`email:${email}`, sessionId, { expirationTtl: 60 * 60 * 24 * 30 });
  }

  const resumeUrl = `${env.APP_URL || ''}/?resume=${sessionId}`;
  const lockedCount = Object.keys(state?.lockedAnswers || {}).length;

  await sendEmail(env, {
    to: email,
    subject: 'Your Signal Map progress is saved',
    html: renderSaveProgressEmail({ resumeUrl, lockedCount }),
  });

  // Capture the warm lead now — someone who gives their email mid-exercise but
  // never finishes would otherwise be invisible (no completion notification).
  const ctx = state?.contextAnswers || {};
  await recordLead(env, {
    type: 'save',
    savedAt: new Date().toISOString(),
    email,
    product: state?.lockedAnswers?.['00'] || '',
    lockedCount,
    resumeUrl,
    answers: state?.lockedAnswers || {},
    goal: ctx.goal || '', blocker: ctx.blocker || '', tailwind: ctx.tailwind || '',
  });

  return json({ ok: true, sessionId }, env);
}

async function handleSession(url, env) {
  const sessionId = url.searchParams.get('id');
  if (!sessionId) return json({ error: 'Missing id' }, env, 400);
  if (!env.SESSIONS) return json({ error: 'Storage unavailable' }, env, 503);

  const raw = await env.SESSIONS.get(`session:${sessionId}`);
  if (!raw) return json({ error: 'Session not found or expired' }, env, 404);

  const record = JSON.parse(raw);
  return json({ email: record.email, state: record.state, savedAt: record.savedAt }, env);
}

async function handleComplete(request, env) {
  const { email, answers, oneLiner, context } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, env, 400);
  }

  const product = shortName(answers?.['00']) || 'your product';
  const ctx = context || {};

  await sendEmail(env, {
    to: email,
    subject: `Your Signal Map for ${product}`,
    html: renderSignalMapEmail({ product, oneLiner, answers }),
  });

  if (env.SESSIONS) {
    await env.SESSIONS.put(`lead:${Date.now()}:${email}`,
      JSON.stringify({ email, product, oneLiner, answers, context: ctx, completedAt: Date.now() }),
      { expirationTtl: 60 * 60 * 24 * 365 });
  }

  await recordLead(env, {
    type: 'complete',
    completedAt: new Date().toISOString(),
    email, product, oneLiner, answers,
    goal: ctx.goal || '', blocker: ctx.blocker || '', tailwind: ctx.tailwind || '',
  });

  // Notify the team that a new lead completed the exercise. Best-effort:
  // a failed notification must not break the founder's Signal Map delivery.
  if (env.NOTIFY_EMAIL) {
    try {
      await sendEmail(env, {
        to: env.NOTIFY_EMAIL,
        subject: `New Edge lead: ${product} (${email})`,
        html: renderLeadNotificationEmail({ product, email, oneLiner, answers, context: ctx }),
      });
    } catch (err) {
      console.error('Lead notification failed:', String(err));
    }
  }

  return json({ ok: true }, env);
}

// Append a lead to the external store (a Google Apps Script web app that writes
// a row to a Sheet — see the-edge-worker/leads-sheet.gs). Best-effort: a failed
// or unconfigured webhook must never break the founder-facing flow. No-ops when
// LEADS_WEBHOOK_URL is unset, so it's safe to ship before the Sheet exists.
async function recordLead(env, lead) {
  if (!env.LEADS_WEBHOOK_URL) return;
  try {
    await fetch(env.LEADS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.LEADS_WEBHOOK_SECRET || '', ...lead }),
    });
  } catch (err) {
    console.error('Lead webhook failed:', String(err));
  }
}

async function sendEmail(env, { to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL || 'The Edge <edge@galvanite.io>',
      to: [to], subject, html,
    }),
  });
  if (!res.ok) throw new Error('Resend failed: ' + (await res.text()));
  return res.json();
}
