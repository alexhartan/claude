import { useState } from 'react';

function generateOneLiners(answers) {
  const product = answers['00'] || '[product]';
  const user = answers['01'] || '[user]';
  const obstacle = answers['02a'] || '[obstacle]';
  const belief = answers['02c'] || '[belief]';
  const transformation = answers['07'] || '[transformation]';
  const cost = answers['06'] || '[cost]';

  const shortCost = cost.split(/[.,;]/)[0].trim();
  const shortObstacle = obstacle.split(/[.,;]/)[0].trim();
  const shortTransformation = transformation.split(/[.,;]/)[0].trim();

  return [
    { label: 'Outcome-led', use: 'Best for homepage hero',
      text: `${product} helps ${user.toLowerCase()} ${shortTransformation.toLowerCase()}. Without ${shortCost.toLowerCase()}.` },
    { label: 'Obstacle-led', use: 'Best for sales decks and outbound',
      text: `${user} struggle with ${shortObstacle.toLowerCase()}. ${product} helps them ${shortTransformation.toLowerCase()}.` },
    { label: 'Belief-led', use: 'Best for thought leadership and founder posts',
      text: `${belief} ${product} helps ${user.toLowerCase()} ${shortTransformation.toLowerCase()}.` },
  ];
}

export default function OneLinerSelect({ lockedAnswers, onConfirm }) {
  const variants = generateOneLiners(lockedAnswers);
  const [selected, setSelected] = useState(null);

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
