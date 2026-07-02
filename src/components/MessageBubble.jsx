import { memo } from "react";
import { Check, Copy, RefreshCcw } from "lucide-react";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
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
};

const MarkdownBody = memo(function MarkdownBody({ content }) {
  return <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>;
});

function MessageBubble({ message, onCopy, onRegenerate, copied }) {
  const isAssistant = message.role === "assistant";

  return (
    <article className={`message-row ${isAssistant ? "assistant" : "user"}`}>
      <div className="message-bubble">
        <MarkdownBody content={message.content} />
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
            </div>
            <p className="message-disclaimer mobile-only-block">Garo2 is AI and can make mistakes.</p>
          </>
        ) : null}
      </div>
    </article>
  );
}

export default memo(MessageBubble);
