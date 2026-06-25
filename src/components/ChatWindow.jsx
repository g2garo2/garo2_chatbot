import MessageBubble from "./MessageBubble";

function getGreeting(userName) {
  const hour = new Date().getHours();
  let greeting = "Good evening";

  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  }

  return `${greeting}, ${userName}. What can I help you with today?`;
}

export default function ChatWindow({
  messages,
  pending,
  bottomRef,
  onCopyMessage,
  onRegenerateMessage,
  copiedMessageId,
  userName = "there",
}) {
  const greetingMessage = getGreeting(userName);

  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <p className="hero-copy hero-copy-strong hero-copy-greeting">{greetingMessage}</p>
        </div>
        <p className="hero-copy hero-copy-greeting mobile-only-block empty-state-mobile-greeting">{greetingMessage}</p>
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
