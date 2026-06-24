// The Edge — Cloudflare Worker

import { SYSTEM_BASE, buildStepSystem } from './systemPrompt.js';
import { renderSignalMapEmail, renderSaveProgressEmail, renderLeadNotificationEmail } from './email.js';

const MODEL = 'claude-sonnet-4-6';

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
      if (url.pathname === '/api/save' && request.method === 'POST') return await handleSave(request, env);
      if (url.pathname === '/api/complete' && request.method === 'POST') return await handleComplete(request, env);
      if (url.pathname === '/api/session' && request.method === 'GET') return await handleSession(url, env);
      return json({ error: 'Not found' }, env, 404);
    } catch (err) {
      return json({ error: 'Server error', detail: String(err) }, env, 500);
    }
  },
};

async function handleChat(request, env) {
  const { userMessage, currentStepId, pushbackCount = 0, history = [] } = await request.json();
  if (!userMessage || !currentStepId) return json({ error: 'Missing userMessage or currentStepId' }, env, 400);

  const system = [
    { type: 'text', text: SYSTEM_BASE, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: buildStepSystem(currentStepId, pushbackCount) },
  ];

  const messages = [...history.slice(-6), { role: 'user', content: userMessage }];

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: 600, system, messages }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error('Anthropic call failed', res.status, detail);
    return json({ error: 'LLM call failed', status: res.status, detail }, env, 502);
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
  const { email, answers, oneLiner } = await request.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email required' }, env, 400);
  }

  const product = answers?.['00'] || 'your product';

  await sendEmail(env, {
    to: email,
    subject: `Your Signal Map for ${product}`,
    html: renderSignalMapEmail({ product, oneLiner, answers }),
  });

  if (env.SESSIONS) {
    await env.SESSIONS.put(`lead:${Date.now()}:${email}`,
      JSON.stringify({ email, product, oneLiner, answers, completedAt: Date.now() }),
      { expirationTtl: 60 * 60 * 24 * 365 });
  }

  // Notify the team that a new lead completed the exercise. Best-effort:
  // a failed notification must not break the founder's Signal Map delivery.
  if (env.NOTIFY_EMAIL) {
    try {
      await sendEmail(env, {
        to: env.NOTIFY_EMAIL,
        subject: `New Edge lead: ${product} (${email})`,
        html: renderLeadNotificationEmail({ product, email, oneLiner, answers }),
      });
    } catch (err) {
      console.error('Lead notification failed:', String(err));
    }
  }

  return json({ ok: true }, env);
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
