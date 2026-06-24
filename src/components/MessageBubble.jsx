import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  return (
    <article className={`message-row ${message.role === "assistant" ? "assistant" : "user"}`}>
      <div className="message-bubble">
        {message.image_url ? <img className="message-image" src={message.image_url} alt="Uploaded prompt" /> : null}
        <ReactMarkdown>{message.content}</ReactMarkdown>
      </div>
    </article>
  );
}
