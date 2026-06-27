import { Check, Copy, Download, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message, onCopy, onRegenerate, copied }) {
  const isAssistant = message.role === "assistant";
  const generatedImageUrl = message.generated_image_url || null;

  return (
    <article className={`message-row ${isAssistant ? "assistant" : "user"}`}>
      <div className="message-bubble">
        {message.image_url ? <img className="message-image" src={message.image_url} alt="Uploaded prompt" /> : null}
        {generatedImageUrl ? <img className="message-image generated-image" src={generatedImageUrl} alt="Generated result" /> : null}
        <ReactMarkdown
          components={{
            a: ({ ...props }) => <a {...props} target="_blank" rel="noreferrer" />,
            code: ({ inline, className, children, ...props }) =>
              inline ? (
                <code className={className} {...props}>
                  {children}
                </code>
              ) : (
                <pre className="message-code-block">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ),
            table: ({ children }) => (
              <div className="table-wrap">
                <table>{children}</table>
              </div>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
        {isAssistant ? (
          <>
            <div className="message-actions">
              <button
                type="button"
                className="message-action-button"
                onClick={() => onCopy?.(message)}
                aria-label="Copy response"
                title="Copy response"
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <button
                type="button"
                className="message-action-button"
                onClick={() => onRegenerate?.(message)}
                aria-label="Regenerate response"
                title="Regenerate response"
              >
                <RefreshCcw size={15} />
                <span>Regenerate</span>
              </button>
              {generatedImageUrl ? (
                <a
                  className="message-action-button"
                  href={generatedImageUrl}
                  download={`garo2-generated-${message.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download size={15} />
                  <span>Download</span>
                </a>
              ) : null}
            </div>
            <p className="message-disclaimer mobile-only-block">Garo2 is AI and can make mistakes.</p>
          </>
        ) : null}
      </div>
    </article>
  );
}
