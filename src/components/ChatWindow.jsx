import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, pending, bottomRef, onCopyMessage, onRegenerateMessage, copiedMessageId }) {
  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <p className="hero-copy hero-copy-strong">What can I help you with today?</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <div className="chat-column">
        {messages.map((message) => {
          const messageId = String(message.id);

          return (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={onCopyMessage}
              onRegenerate={onRegenerateMessage}
              copied={copiedMessageId === messageId}
            />
          );
        })}
        {pending ? <div className="typing-indicator"><span /><span /><span /></div> : null}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
