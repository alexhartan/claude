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

export function getStepById(id) { return STEPS.find((s) => s.id === id); }
export function getStepIndex(id) { return STEPS.findIndex((s) => s.id === id); }
export function getNextStepId(currentId) {
  const idx = getStepIndex(currentId);
  if (idx === -1 || idx === STEPS.length - 1) return null;
  return STEPS[idx + 1].id;
}
