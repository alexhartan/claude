const KEY = 'the-edge:session-v1';

export function loadSession() {
  try { const raw = localStorage.getItem(KEY); if (!raw) return null; return JSON.parse(raw); }
  catch (e) { return null; }
}

export function saveSession(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch (e) {}
}
