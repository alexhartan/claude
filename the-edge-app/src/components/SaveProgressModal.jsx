import { useState, useEffect, useRef } from 'react';

export default function SaveProgressModal({ open, onClose, onSubmit, initialEmail = '', isComplete }) {
  const [email, setEmail] = useState(initialEmail);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef(null);

  // Reset form state only when the modal opens. Submitting calls onSubmit, which
  // updates the parent's email and thus initialEmail — if that were a dependency
  // here, the effect would re-run and bounce the user back to the form, forcing a
  // second submit. Keying the reset to `open` alone avoids that.
  useEffect(() => {
    if (open) {
      setEmail(initialEmail);
      setSubmitted(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function handleSubmit() {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    onSubmit(email.trim());
    setSubmitted(true);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {!submitted ? (
          <>
            <h2 className="modal-title">{isComplete ? 'Get your Signal Map' : 'Save your progress'}</h2>
            <p className="modal-body">
              {isComplete
                ? "Your Signal Map is ready. We'll send the formatted version to your inbox."
                : "We'll send you a link to pick up where you left off, and your finished Signal Map when you complete the exercise."}
            </p>
            <div className="modal-form">
              <input ref={inputRef} type="email" className="modal-input" placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} />
              <button className="modal-submit" onClick={handleSubmit} disabled={!email.trim()}>
                {isComplete ? 'Send my Signal Map' : 'Save and continue'}
              </button>
            </div>
            <p className="modal-fine">
              {isComplete ? 'No spam. Just your Signal Map.' : 'No spam. One email now, one when you finish.'}
            </p>
          </>
        ) : (
          <>
            <div className="modal-success-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="modal-title">{isComplete ? 'Signal Map sent' : 'Saved'}</h2>
            <p className="modal-body">
              {isComplete
                ? `Check your inbox at ${email}. Your Signal Map is on its way.`
                : `Check your inbox at ${email} for a link to pick up where you left off.`}
            </p>
            <button className="modal-submit" onClick={onClose}>{isComplete ? 'Done' : 'Keep going'}</button>
          </>
        )}
      </div>
    </div>
  );
}
