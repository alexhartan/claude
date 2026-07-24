export default function Intro({ onStart }) {
  return (
    <div className="intro">
      <div className="intro-inner">
        <p className="intro-body">
          This is The Edge, a free brand strategy tool by Alex Hartan of{' '}
          <a href="https://www.galvanite.io?utm_source=edge" target="_blank" rel="noopener noreferrer" className="intro-link">
            Galvanite
          </a>
          . In about 20 minutes, you'll find the sharpest version of your story, the one customers and investors get behind.
        </p>
        <p className="intro-prompt">Ready?</p>
        <button className="intro-start" onClick={onStart}>Let's go</button>
      </div>
    </div>
  );
}
