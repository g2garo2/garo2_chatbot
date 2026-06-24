import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages, pending, bottomRef }) {
  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <h2>Start a conversation</h2>
          <p>Ask in English or Garo, choose the output language, and optionally attach an image.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {pending ? <div className="typing-indicator">Garo2 is thinking...</div> : null}
      <div ref={bottomRef} />
    </section>
  );
}
