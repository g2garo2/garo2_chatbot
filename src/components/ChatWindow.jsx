import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, pending, bottomRef }) {
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
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {pending ? <div className="typing-indicator"><span /><span /><span /></div> : null}
        <div ref={bottomRef} />
      </div>
    </section>
  );
}
