// The Edge — 10 steps

export const STEPS = [
  { id: '00', title: 'The Product', sidebarLabel: 'the product',
    openingProbe: 'What is the name of your brand?' },
  { id: '01', title: 'The User', sidebarLabel: 'the user',
    openingProbe: 'How would you describe someone using it? Be specific. Role, what kind of company, what they care about.' },
  { id: '02a', title: 'The Obstacle', sidebarLabel: 'obstacle',
    openingProbe: "What's literally going wrong in their world right now? The surface problem." },
  { id: '02b', title: 'The Struggle', sidebarLabel: 'struggle',
    openingProbe: 'How does that obstacle make them feel internally? What are some feelings that they have because of it?' },
  { id: '02c', title: 'The Just Cause', sidebarLabel: 'just cause',
    openingProbe: "What makes this plain wrong, from their perspective? What's the underlying truth they believe in, when it comes to that struggle?" },
  { id: '03', title: 'The Solution', sidebarLabel: 'solution',
    openingProbe: 'How does your product meet them in that struggle? Two halves: what you understand about their problem, and what gives you the right to solve it.' },
  { id: '04', title: 'The Process', sidebarLabel: 'process',
    openingProbe: 'What are the three steps from broken to working? Each step is something they do, ~10 words max.' },
  { id: '05', title: 'The Next Step', sidebarLabel: 'next step',
    openingProbe: "What's the single clearest thing you want them to do right now? You'll need two: the direct ask, and a transitional ask for people not ready yet." },
  { id: '06', title: 'The Cost', sidebarLabel: 'cost of inaction',
    openingProbe: 'What does it cost them to keep doing it the old way? Specifics: time, money, talent, opportunity, reputation.' },
  { id: '07', title: 'The Transformation', sidebarLabel: 'transformation',
    openingProbe: 'What does their world look like once your product is working? Two layers: what they can now do (functional), and who they become (identity).' },
];

export const TOTAL_STEPS = STEPS.length;

// Context intake — three qualification questions asked after the brand name and
// before the positioning exercise. These are for the team (lead capture), NOT
// part of the Signal Map: they never appear in the sidebar, the one-liner, or
// the founder's report, and they do not advance the "N of 10" counter.
export const INTAKE_STEPS = [
  { id: 'ctx_goal', field: 'goal',
    probe: "Before we dive in, three quick questions for context.\n\nWhat are you trying to make happen in the next 6–12 months? And what's made it a priority now, specifically?" },
  { id: 'ctx_blocker', field: 'blocker',
    probe: "What's the biggest thing standing between you and that right now?" },
  { id: 'ctx_tailwind', field: 'tailwind',
    probe: "What's working in your favor right now? Inside and outside of your business." },
];

const INTAKE_BY_ID = Object.fromEntries(INTAKE_STEPS.map((s) => [s.id, s]));
export function isIntakeId(id) { return typeof id === 'string' && id.startsWith('ctx_'); }
export function getIntakeStep(id) { return INTAKE_BY_ID[id]; }

// Full conversation order: brand name (00) → three context questions → the ten
// Signal Map steps. STEPS[0] is '00', so the ten pick up from STEPS.slice(1).
export const FLOW_ORDER = ['00', 'ctx_goal', 'ctx_blocker', 'ctx_tailwind', ...STEPS.slice(1).map((s) => s.id)];

export function getStepById(id) { return STEPS.find((s) => s.id === id); }
export function getStepIndex(id) { return STEPS.findIndex((s) => s.id === id); }
export function getNextStepId(currentId) {
  const idx = getStepIndex(currentId);
  if (idx === -1 || idx === STEPS.length - 1) return null;
  return STEPS[idx + 1].id;
}

// Next id in the full flow (includes the intake questions). Returns null after
// the last Signal Map step, which the app reads as "go to the one-liner stage".
export function getNextFlowId(currentId) {
  const i = FLOW_ORDER.indexOf(currentId);
  if (i === -1 || i === FLOW_ORDER.length - 1) return null;
  return FLOW_ORDER[i + 1];
}
