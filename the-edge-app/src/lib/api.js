// Real backend client. Mirrors mockChat contract.

import { getNextFlowId } from './steps.js';
import { localOneLiners } from './oneliners.js';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export async function chat({ userMessage, currentStepId, pushbackCount, history = [] }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userMessage, currentStepId, pushbackCount, history }),
  });
  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);
  const data = await res.json();
  const next_step = data.step_status === 'locked' ? getNextFlowId(currentStepId) : null;
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

export async function completeAndEmail({ email, answers, oneLiner, context }) {
  const res = await fetch(`${API_BASE}/api/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, answers, oneLiner, context }),
  });
  if (!res.ok) throw new Error(`Complete failed: ${res.status}`);
  return res.json();
}

// Ask the Worker to write three polished one-liners from the captured answers.
// Falls back to the local heuristic if the call fails or returns nothing usable.
export async function getOneLiners(answers) {
  try {
    const res = await fetch(`${API_BASE}/api/oneliners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error(`One-liners failed: ${res.status}`);
    const data = await res.json();
    const variants = data.variants;
    if (Array.isArray(variants) && variants.length && variants.every((v) => v.text)) {
      return variants;
    }
    throw new Error('Empty one-liners');
  } catch (e) {
    console.error('One-liner polish failed, using local fallback:', e);
    return localOneLiners(answers);
  }
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/api/session?id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error(`Session fetch failed: ${res.status}`);
  return res.json(); // { email, state, savedAt }
}

export function getOpeningMessage() {
  return 'What is the name of your brand?';
}
