import MessageBubble from "./MessageBubble";

const starterPrompts = [
  "Translate this English message into natural Garo.",
  "Summarize this topic in simple bullet points.",
  "Help me write a clear reply for a work message.",
  "Describe what is happening in this image.",
];

export default function ChatWindow({ messages, pending, bottomRef, onPromptSelect }) {
  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <div className="eyebrow">Bilingual AI chat</div>
          <h2>What can I help you with today?</h2>
          <p className="hero-copy">
            Ask questions, translate between English and Garo, analyze images, or draft replies with a clean chat experience across devices.
          </p>
          <div className="prompt-grid">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                className="prompt-card"
                onClick={() => onPromptSelect(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>
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
