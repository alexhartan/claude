// Real backend client. Mirrors mockChat contract.

import { getNextStepId } from './steps.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export async function chat({ userMessage, currentStepId, pushbackCount, history = [] }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, currentStepId, pushbackCount, history }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  const data = await res.json();
  const next_step = data.step_status === 'locked' ? getNextStepId(currentStepId) : null;
  return {
    assistant_message: data.assistant_message,
    step_status: data.step_status,
    pushback_count: data.pushback_count,
    captured_answer: data.captured_answer,
    next_step,
  };
}

export async function saveProgress({ email, state }) {
  const res = await fetch(`${API_BASE}/api/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, state }),
  });
  if (!res.ok) throw new Error(`Save failed: ${res.status}`);
  return res.json();
}

export async function completeAndEmail({ email, answers, oneLiner }) {
  const res = await fetch(`${API_BASE}/api/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, answers, oneLiner }),
  });
  if (!res.ok) throw new Error(`Complete failed: ${res.status}`);
  return res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/session?id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
  return res.json(); // { email, state, savedAt }
}

export function getOpeningMessage() {
  return 'What is the name of your product or service?';
}
