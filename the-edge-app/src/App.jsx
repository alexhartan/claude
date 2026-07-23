import { useEffect, useState } from 'react';
import ConversationPane from './components/ConversationPane.jsx';
import SignalSummary from './components/SignalSummary.jsx';
import SaveProgressModal from './components/SaveProgressModal.jsx';
import OneLinerSelect from './components/OneLinerSelect.jsx';
import Intro from './components/Intro.jsx';
import { STEPS, TOTAL_STEPS, getStepById, isIntakeId, getIntakeStep } from './lib/steps.js';
import { loadSession, saveSession, clearSession } from './lib/storage.js';

// The assistant message that introduces the step the founder is entering.
// Intake steps carry their own probe; entering the first real step (01) leads
// with the brand-story transition and injects the locked brand name.
function openingMessageForStep(nextId, brand) {
  if (isIntakeId(nextId)) return getIntakeStep(nextId).probe;
  const step = getStepById(nextId);
  if (nextId === '01') {
    // Step 00 now captures name + what they sell, so take the first clause as the name.
    const name = (brand || '').split(/[.\n!?]/)[0].trim() || 'your brand';
    return `Excellent! Now let's build the brand story of ${name}.\n\n${step.openingProbe}`;
  }
  return step.openingProbe;
}

// Toggle: VITE_USE_MOCK=true for offline heuristics, false for real Worker
import * as realApi from './lib/api.js';
import { mockChat, getOpeningMessage as mockOpening, getOneLiners as mockOneLiners } from './lib/mockChat.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

const sendToBackend = USE_MOCK ? mockChat : realApi.chat;
const getOpeningMessage = USE_MOCK ? mockOpening : realApi.getOpeningMessage;
const fetchOneLiners = USE_MOCK ? mockOneLiners : realApi.getOneLiners;

const STAGE = {
  INTRO: 'intro',
  CONVERSATION: 'conversation',
  ONELINER_SELECT: 'oneliner_select',
  COMPLETE: 'complete',
};

export default function App() {
  const [messages, setMessages] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentStepId, setCurrentStepId] = useState('00');
  const [pushbackCount, setPushbackCount] = useState(0);
  const [lockedAnswers, setLockedAnswers] = useState({});
  // Context intake answers (goal/blocker/tailwind). Kept separate from
  // lockedAnswers so they never reach the sidebar, one-liner, or Signal Map.
  const [contextAnswers, setContextAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [stage, setStage] = useState(STAGE.INTRO);
  const [chosenOneLiner, setChosenOneLiner] = useState(null);

  function hydrate(session) {
    if (!session || !session.messages?.length) return false;
    setMessages(session.messages);
    setCurrentStepId(session.currentStepId || '00');
    setPushbackCount(session.pushbackCount || 0);
    setLockedAnswers(session.lockedAnswers || {});
    setContextAnswers(session.contextAnswers || {});
    setEmail(session.email || '');
    setStage(session.stage || STAGE.CONVERSATION);
    setChosenOneLiner(session.chosenOneLiner || null);
    return true;
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resumeId = params.get('resume');

    // Resume-by-link: a saved-progress email points here with ?resume=<sessionId>.
    // Fetch the stored state from the Worker (cross-device), then strip the param
    // so a later refresh uses the now-synced localStorage copy instead.
    if (resumeId && !USE_MOCK) {
      realApi.fetchSession(resumeId)
        .then(({ email: savedEmail, state }) => {
          hydrate({ ...state, email: savedEmail, stage: STAGE.CONVERSATION });
        })
        .catch(() => {
          hydrate(loadSession()); // fall back to whatever is local
        })
        .finally(() => {
          window.history.replaceState({}, '', window.location.pathname);
        });
      return;
    }

    hydrate(loadSession());
  }, []);

  useEffect(() => {
    if (stage === STAGE.INTRO) return;
    saveSession({ messages, currentStepId, pushbackCount, lockedAnswers, contextAnswers, email, stage, chosenOneLiner });
  }, [messages, currentStepId, pushbackCount, lockedAnswers, contextAnswers, email, stage, chosenOneLiner]);

  function handleStart() {
    setStage(STAGE.CONVERSATION);
    setMessages([{ role: 'assistant', content: getOpeningMessage() }]);
  }

  async function handleSend(userMessage) {
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsThinking(true);

    try {
      const response = await sendToBackend({
        userMessage, currentStepId, pushbackCount,
        history: messages.slice(-6),
      });

      setIsThinking(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: response.assistant_message }]);

      if (response.step_status === 'locked') {
        const lockedId = currentStepId;
        // Advance on any lock. If the model omits captured_answer (it sometimes
        // does on the final intake, where it writes a transition instead), fall
        // back to the founder's own message so the flow never stalls.
        const captured = response.captured_answer || userMessage.trim();
        if (isIntakeId(lockedId)) {
          // Intake answers go to their own bucket, keyed by field (goal/blocker/tailwind).
          const field = getIntakeStep(lockedId).field;
          setContextAnswers((prev) => ({ ...prev, [field]: captured }));
        } else {
          setLockedAnswers((prev) => ({ ...prev, [lockedId]: captured }));
        }
        setPushbackCount(0);

        if (response.next_step) {
          const brand = lockedAnswers['00'];
          setCurrentStepId(response.next_step);
          setTimeout(() => {
            setMessages((prev) => [...prev, { role: 'assistant', content: openingMessageForStep(response.next_step, brand) }]);
          }, 600);
        } else {
          setTimeout(() => setStage(STAGE.ONELINER_SELECT), 800);
        }
      } else {
        setPushbackCount(response.pushback_count);
      }
    } catch (e) {
      setIsThinking(false);
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Something went wrong. Try again?' }]);
    }
  }

  function handleSaveProgress() { setSaveModalOpen(true); }

  async function handleEmailSubmit(submittedEmail) {
    setEmail(submittedEmail);
    if (USE_MOCK) { console.log('[mock] would save/email for:', submittedEmail); return; }
    try {
      if (isComplete) {
        await realApi.completeAndEmail({ email: submittedEmail, answers: lockedAnswers, oneLiner: chosenOneLiner, context: contextAnswers });
      } else {
        await realApi.saveProgress({ email: submittedEmail, state: { lockedAnswers, contextAnswers, currentStepId, messages, chosenOneLiner } });
      }
    } catch (e) { console.error('Email/save failed:', e); }
  }

  function handleOneLinerConfirm(text) {
    setChosenOneLiner(text);
    setStage(STAGE.COMPLETE);
    setSaveModalOpen(true);
  }

  function handleReset() {
    if (!confirm('Reset and start over? Your progress will be lost.')) return;
    clearSession();
    window.location.reload();
  }

  const lockedCount = Object.keys(lockedAnswers).length;
  const isComplete = stage === STAGE.COMPLETE;
  const isIntro = stage === STAGE.INTRO;
  const inIntake = isIntakeId(currentStepId);
  const currentStepNum = Math.min(lockedCount + 1, TOTAL_STEPS);
  // Sidebar stays collapsed until the founder has locked at least one answer.
  const showSidebar = !isIntro && lockedCount > 0;

  return (
    <div className="app">
      <div className="atmosphere" />
      <header className="app-header">
        <div className="app-header-mark">
          <img src="/logo.svg" alt="The Edge by Galvanite" className="app-header-logo" />
        </div>
        {!isIntro && (
          <div className="app-header-progress">
            <span className="app-header-step">{inIntake ? 'Quick context' : `Step ${currentStepNum} of ${TOTAL_STEPS}`}</span>
            {lockedCount > 0 && (
              <button className="app-header-reset" onClick={handleReset}>Start over</button>
            )}
          </div>
        )}
      </header>

      <main className={showSidebar ? 'app-main' : 'app-main app-main--no-sidebar'}>
        {showSidebar && (
          <SignalSummary lockedAnswers={lockedAnswers} onSaveProgress={handleSaveProgress} isComplete={isComplete} />
        )}

        {stage === STAGE.INTRO && (
          <div className="conversation-pane app-main--full"><Intro onStart={handleStart} /></div>
        )}

        {stage === STAGE.CONVERSATION && (
          <ConversationPane messages={messages} isThinking={isThinking} onSend={handleSend} isComplete={false} />
        )}

        {stage === STAGE.ONELINER_SELECT && (
          <div className="conversation-pane">
            <div className="conversation-scroll">
              <div className="conversation-inner">
                <OneLinerSelect lockedAnswers={lockedAnswers} onConfirm={handleOneLinerConfirm} fetchOneLiners={fetchOneLiners} />
              </div>
            </div>
          </div>
        )}

        {stage === STAGE.COMPLETE && (
          <div className="conversation-pane">
            <div className="conversation-scroll">
              <div className="conversation-inner">
                <div className="complete-screen">
                  <div className="complete-eyebrow">Done</div>
                  <h2 className="complete-title">Your Signal Map is ready.</h2>
                  <div className="complete-oneliner-block">
                    <div className="complete-oneliner-label">The One-Liner</div>
                    <p className="complete-oneliner-text">{chosenOneLiner}</p>
                  </div>
                  <p className="complete-body">Your Signal Map is ready. Enter your email address and we'll send it to you for free.</p>
                  <button className="oneliner-confirm" onClick={() => setSaveModalOpen(true)}>Send it to my inbox</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SaveProgressModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSubmit={handleEmailSubmit}
        initialEmail={email}
        isComplete={isComplete}
      />
    </div>
  );
}
