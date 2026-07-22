// The Edge — 10 steps

export const STEPS = [
  { id: '00', title: 'The Business', sidebarLabel: 'the business',
    openingProbe: 'What is the name of your business? What are you selling, and what makes it special?' },
  { id: '01', title: 'The User', sidebarLabel: 'the user',
    openingProbe: 'How would you describe someone using it? Who are they? What do they care about?' },
  { id: '02a', title: 'The Problem', sidebarLabel: 'the problem',
    openingProbe: "What is the biggest thing they are struggling with right now? What's on their mind?" },
  { id: '02b', title: 'The Feeling', sidebarLabel: 'the frustration',
    openingProbe: 'How does this problem make them feel?' },
  { id: '02c', title: 'The Belief', sidebarLabel: 'the belief',
    openingProbe: 'Why is that plain wrong? Why should things be different?' },
  { id: '03a', title: 'Empathy', sidebarLabel: 'empathy',
    openingProbe: 'How can you show empathy and prove that you understand their struggle?' },
  { id: '03b', title: 'Authority', sidebarLabel: 'credibility',
    openingProbe: 'Why should they believe you? How can you demonstrate that you are qualified to solve it?' },
  { id: '04', title: 'The Process', sidebarLabel: 'the process',
    openingProbe: "What's the 3-step process that gets them the result they want, in relation with your product?" },
  { id: '05a', title: 'Call to Action', sidebarLabel: 'call to action',
    openingProbe: "Now the ask: if they're ready, what should they do right now?" },
  { id: '05b', title: 'Secondary CTA', sidebarLabel: 'secondary action',
    openingProbe: "If they're interested but not ready, what's the secondary call to action?" },
  { id: '06', title: 'The Cost', sidebarLabel: 'cost of inaction',
    openingProbe: "What's the cost of not solving this problem? Be specific: time, money, talent, opportunity, reputation, etc." },
  { id: '07', title: 'The Transformation', sidebarLabel: 'transformation',
    openingProbe: 'What does their world look like once your product is working for them? What are they able to do now? Who have they become?' },
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
