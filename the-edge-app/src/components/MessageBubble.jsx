export default function MessageBubble({ role, content }) {
  if (role === 'user') {
    return (
      <div className="msg msg--user">
        <div className="msg-bubble msg-bubble--user">{content}</div>
      </div>
    );
  }
  return (
    <div className="msg msg--assistant">
      <div className="msg-bubble msg-bubble--assistant">
        {content.split('\n\n').map((para, i) => (<p key={i}>{para}</p>))}
      </div>
    </div>
  );
}
