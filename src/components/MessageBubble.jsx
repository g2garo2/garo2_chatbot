import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  return (
    <article className={`message-row ${message.role === "assistant" ? "assistant" : "user"}`}>
      <div className="message-bubble">
        {message.image_url ? <img className="message-image" src={message.image_url} alt="Uploaded prompt" /> : null}
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
      </div>
    </article>
  );
}
