import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import InputBar from './InputBar.jsx';

export default function ConversationPane({ messages, isThinking, onSend, isComplete }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isThinking]);

  return (
    <div className="conversation-pane">
      <div className="conversation-scroll" ref={scrollRef}>
        <div className="conversation-inner">
          {messages.map((msg, i) => <MessageBubble key={i} role={msg.role} content={msg.content} />)}
          {isThinking && (
            <div className="msg msg--assistant"><TypingIndicator /></div>
          )}
        </div>
      </div>
      <div className="conversation-input-wrap">
        <div className="conversation-input-inner">
          <InputBar onSend={onSend} disabled={isThinking || isComplete} />
        </div>
      </div>
    </div>
  );
}
