export default function Intro({ onStart }) {
  return (
    <div className="intro">
      <div className="intro-inner">
        <p className="intro-body">
          This is The Edge, a free strategy tool by Alex Hartan of{' '}
          <a href="https://www.galvanite.io?utm_source=edge" target="_blank" rel="noopener noreferrer" className="intro-link">
            Galvanite
          </a>
          , designed to help you identify your product's unique edge and craft a compelling brand story around it.
        </p>
        <p className="intro-prompt">Ready?</p>
        <button className="intro-start" onClick={onStart}>Let's go</button>
      </div>
    </div>
  );
}
