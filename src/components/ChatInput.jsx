import { useEffect, useRef, useState } from "react";
import { ImagePlus, Send } from "lucide-react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [text]);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() && !imageFile) return;
    await onSend({ text: text.trim() || "Please analyze this image.", imageFile });
    setText("");
    setImageFile(null);
  };

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer-row">
        <label className="upload-button">
          <ImagePlus size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            hidden
          />
        </label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Ask anything"
          rows={1}
          disabled={disabled}
          className="composer-textarea"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(event);
            }
          }}
        />
        <button className="send-button" type="submit" disabled={disabled}>
          <Send size={18} />
        </button>
      </div>
      {imageFile ? <div className="image-pill">{imageFile.name}</div> : null}
      <p className="composer-note desktop-only-block">Garo2 can make mistakes. Check important info.</p>
    </form>
  );
}
