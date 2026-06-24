import MessageBubble from "./MessageBubble";

function getGreeting(name) {
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  return `${greeting} ${name || "there"}`;
}

export default function ChatWindow({ messages, pending, bottomRef, user }) {
  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <div className="eyebrow">Garo2</div>
          <h2>{getGreeting(user?.name)}</h2>
          <p className="hero-copy hero-copy-strong">What can I help you with today</p>
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
