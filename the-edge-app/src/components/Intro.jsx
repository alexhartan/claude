export default function Intro({ onStart }) {
  return (
    <div className="intro">
      <div className="intro-inner">
        <p className="intro-body">
          This is The Edge, a free digital tool by{' '}
          <a href="https://www.galvanite.io?utm_source=edge" target="_blank" rel="noopener noreferrer" className="intro-link">
            Galvanite
          </a>
          , helping you discover the components of your product's story and what makes it unique and relevant for your customers.
        </p>
        <p className="intro-prompt">Ready?</p>
        <button className="intro-start" onClick={onStart}>Let's go</button>
      </div>
    </div>
  );
}
