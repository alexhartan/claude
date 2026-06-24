import { useEffect, useRef } from 'react';
import ClarityMeter from './ClarityMeter.jsx';
import { STEPS, TOTAL_STEPS } from '../lib/steps.js';

function CheckmarkIcon({ id }) {
  const clipId = `clip-${id}`;
  return (
    <svg className="signal-summary-item-icon" width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <g clipPath={`url(#${clipId})`}>
        <rect width="13" height="13" rx="6.5" fill="#162140" />
        <path d="M3.25 5.81818L6.55556 9L13.75 2" stroke="#66CCFF" strokeWidth="2" />
      </g>
      <rect x="0.5" y="0.5" width="12" height="12" rx="6" stroke="#66CCFF" strokeOpacity="0.4" />
      <defs>
        <clipPath id={clipId}>
          <rect width="13" height="13" rx="6.5" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export default function SignalSummary({ lockedAnswers, onSaveProgress, isComplete }) {
  const lockedCount = Object.keys(lockedAnswers).length;
  const percent = (lockedCount / TOTAL_STEPS) * 100;
  const visibleSteps = STEPS.filter((step) => !!lockedAnswers[step.id]);
  const bodyRef = useRef(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const t = setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 120);
    return () => clearTimeout(t);
  }, [lockedCount]);

  return (
    <aside className="signal-summary">
      <div className="signal-summary-body" ref={bodyRef}>
        <div className="signal-summary-list">
          {visibleSteps.map((step) => (
            <div className="signal-summary-item" key={step.id}>
              <div className="signal-summary-item-header">
                <CheckmarkIcon id={step.id} />
                <span className="signal-summary-item-label">{step.sidebarLabel}</span>
              </div>
              <div className="signal-summary-item-value">{lockedAnswers[step.id]}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="signal-summary-footer">
        <ClarityMeter percent={percent} />
        <button className="signal-summary-save" onClick={onSaveProgress} disabled={lockedCount === 0 && !isComplete}>
          {isComplete ? 'Get my Signal Map' : 'Save my progress'}
        </button>
      </div>
    </aside>
  );
}
