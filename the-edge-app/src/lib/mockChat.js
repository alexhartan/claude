// Mocked LLM responses for offline prototype testing
import { getNextStepId } from './steps.js';

function analyzeAnswer(answer, stepId, pushbackCount) {
  const text = answer.trim().toLowerCase();
  const wordCount = text.split(/\s+/).length;

  if (pushbackCount >= 2) return { needsPushback: false, reason: 'max_pushbacks' };

  if (stepId === '00') {
    if (text.length < 2) return { needsPushback: true, reason: 'product_name_missing' };
    return { needsPushback: false, reason: 'passed' };
  }

  if (wordCount < 4) return { needsPushback: true, reason: 'too_short' };

  if (stepId === '01') {
    const generics = ['startups', 'businesses', 'companies', 'developers', 'teams', 'people', 'users', 'designers', 'founders'];
    const isGeneric = generics.some((g) => new RegExp(`\\b${g}\\b`, 'i').test(text) && wordCount < 12);
    if (isGeneric) return { needsPushback: true, reason: 'too_broad_user' };
  }
  if (stepId === '02a') {
    const abstract = ['inefficiency', 'complexity', 'lack of', 'poor', 'better experience', 'pain point'];
    if (abstract.some((a) => text.includes(a)) && wordCount < 20) return { needsPushback: true, reason: 'too_abstract' };
  }
  if (stepId === '02b' && wordCount < 6) return { needsPushback: true, reason: 'too_generic_feeling' };
  if (stepId === '02c' && (text.includes("don't know") || text.includes('not sure') || text === 'skip')) {
    return { needsPushback: true, reason: 'philosophical_skip' };
  }
  if (stepId === '03') {
    const featureWords = ['we have', 'we offer', 'we built', 'our platform', 'our product features'];
    if (featureWords.some((f) => text.includes(f)) && wordCount < 25) return { needsPushback: true, reason: 'feature_list' };
  }
  if (stepId === '04') {
    const stepCount = (answer.match(/\d\./g) || []).length;
    if (stepCount > 0 && stepCount !== 3) {
      return { needsPushback: true, reason: stepCount < 3 ? 'too_few_steps' : 'too_many_steps' };
    }
    if (/we (onboard|configure|set up|provision)/i.test(text)) return { needsPushback: true, reason: 'passive_process' };
  }
  if (stepId === '06' && /fall behind|lose money|less competitive/i.test(text) && wordCount < 15) {
    return { needsPushback: true, reason: 'generic_cost' };
  }
  if (stepId === '07' && wordCount < 15) return { needsPushback: true, reason: 'transformation_thin' };

  return { needsPushback: false, reason: 'passed' };
}

const PUSHBACK_RESPONSES = {
  too_short: [
    "That's a draft. Give me one or two more sentences with the specifics.",
    'Good start. The shape is right, the detail isn\'t there yet.',
  ],
  product_name_missing: ['Need a name to anchor everything to. What do you call this product or service?'],
  too_broad_user: [
    "That's the right shape. Let's narrow it. What's their actual role, what kind of company, what's on their plate this quarter?",
    'Got the category. Now the human. What does their week look like?',
  ],
  too_abstract: [
    "That's the right instinct. Let's make it concrete. What's the actual thing happening on a Tuesday afternoon that makes them open a browser tab?",
    "Directionally right. What's the moment they'd describe to a colleague over lunch?",
  ],
  too_generic_feeling: [
    "That feeling is in the right zone. Let's go one layer deeper. Frustrated about what, specifically? Exposed in front of whom?",
    'The emotion is there. What do they actually feel at 11pm when the thing breaks again?',
  ],
  philosophical_skip: [
    'This one\'s the hardest. Most founders skip it. Finish the sentence "It\'s just wrong that..." What comes after?',
    'Best guess. What belief about how things should work is being broken by the current state?',
  ],
  feature_list: [
    "The features are clear. The step is about standing. What makes you the right ones to fix this, not someone else?",
    "Got the what. Now the why-you. What gives you the credibility to solve this?",
  ],
  too_few_steps: ["Two is the right start. Three is the magic number. What's the missing step in the middle?"],
  too_many_steps: ["You've mapped the full journey. Three is the sweet spot. Which two can collapse into one?"],
  passive_process: ["The shape is right. One adjustment: let's rewrite from their seat. What do they do at each step?"],
  generic_cost: ["That's directionally right. Behind on what, specifically? What's the version they'd recognize themselves in?"],
  transformation_thin: ["You've got the functional half. Now the identity. Who do they become in the eyes of their team?"],
};

const CONFIRMATIONS = ['Good. Now next step.', "Got it. Onto the next.", "That works. Moving on.", "Locked. Next."];

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

export async function mockChat({ userMessage, currentStepId, pushbackCount }) {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));
  const analysis = analyzeAnswer(userMessage, currentStepId, pushbackCount);

  if (analysis.needsPushback) {
    return {
      assistant_message: pickRandom(PUSHBACK_RESPONSES[analysis.reason] || PUSHBACK_RESPONSES.too_short),
      step_status: 'in_progress',
      pushback_count: pushbackCount + 1,
      captured_answer: null,
      next_step: null,
    };
  }

  return {
    assistant_message: pickRandom(CONFIRMATIONS),
    step_status: 'locked',
    pushback_count: pushbackCount,
    captured_answer: userMessage.trim(),
    next_step: getNextStepId(currentStepId),
  };
}

export function getOpeningMessage() {
  return 'What is the name of your product or service?';
}
