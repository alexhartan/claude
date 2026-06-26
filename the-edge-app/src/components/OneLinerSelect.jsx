import { useState, useEffect } from 'react';

export default function OneLinerSelect({ lockedAnswers, onConfirm, fetchOneLiners }) {
  const [variants, setVariants] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;
    fetchOneLiners(lockedAnswers).then((result) => {
      if (active) setVariants(result);
    });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!variants) {
    return (
      <div className="oneliner-select">
        <div className="oneliner-select-header">
          <div className="oneliner-eyebrow">10 of 10 done</div>
          <h2 className="oneliner-title">Polishing your one-liners…</h2>
          <p className="oneliner-subtitle">Turning your answers into three sharp drafts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="oneliner-select">
      <div className="oneliner-select-header">
        <div className="oneliner-eyebrow">10 of 10 done</div>
        <h2 className="oneliner-title">Three drafts. Which one resonates most?</h2>
        <p className="oneliner-subtitle">Pick one. We'll lead with it in your Signal Map.</p>
      </div>
      <div className="oneliner-options">
        {variants.map((variant, i) => (
          <button key={i}
            className={`oneliner-option ${selected === i ? 'oneliner-option--selected' : ''}`}
            onClick={() => setSelected(i)}>
            <div className="oneliner-option-meta">
              <span className="oneliner-option-num">0{i + 1}</span>
              <span className="oneliner-option-label">{variant.label}</span>
              <span className="oneliner-option-use">{variant.use}</span>
            </div>
            <div className="oneliner-option-text">{variant.text}</div>
            <div className="oneliner-option-radio">
              {selected === i && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>
      <div className="oneliner-actions">
        <button className="oneliner-confirm" disabled={selected === null} onClick={() => onConfirm(variants[selected].text)}>
          Use this one-liner
        </button>
      </div>
    </div>
  );
}
