import MessageBubble from "./MessageBubble";

const starterPrompts = [
  "Translate this message into Garo.",
  "Write a short welcome message in English and Garo.",
  "Explain today's top priority in simple English.",
  "Help me answer this image in Garo.",
];

export default function ChatWindow({ messages, pending, bottomRef, onPromptSelect }) {
  if (!messages.length) {
    return (
      <section className="chat-window empty-state">
        <div className="hero-card">
          <h2>What would you like to ask?</h2>
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
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      {pending ? <div className="typing-indicator">Garo2 is thinking...</div> : null}
      <div ref={bottomRef} />
    </section>
  );
}
