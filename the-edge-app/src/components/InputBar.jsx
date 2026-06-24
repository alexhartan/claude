import { useEffect, useRef, useState } from 'react';

export default function InputBar({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const wasDisabled = useRef(disabled);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  // Refocus when transitioning from disabled to enabled
  useEffect(() => {
    if (wasDisabled.current && !disabled) {
      textareaRef.current?.focus();
    }
    wasDisabled.current = disabled;
  }, [disabled]);

  useEffect(() => { if (!disabled) textareaRef.current?.focus(); }, []);

  function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  return (
    <div className="input-bar">
      <textarea
        ref={textareaRef}
        className="input-bar-textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? '' : 'Type your answer…'}
        disabled={disabled}
        rows={1}
      />
      <button className="input-bar-send" onClick={handleSubmit} disabled={!value.trim() || disabled} aria-label="Send">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M28.3064 18.8063L20.2842 10.7841L12.2621 18.8063M20.2842 10.7841L20.2842 29.2159" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}
