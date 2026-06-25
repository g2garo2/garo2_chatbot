import { useEffect, useRef, useState } from "react";
import { GraduationCap, ImagePlus, Landmark, MapPinned, Send } from "lucide-react";

const mobilePromptSuggestions = [
  "Tell me 10 interesting facts about Meghalaya’s history, culture, festivals, tribes, and famous places in simple student-friendly language.",
  "Quiz me with 20 general knowledge questions about Meghalaya, including answers and short explanations.",
  "Explain Meghalaya district-wise with important facts about geography, people, culture, tourism, and current development for students.",
];

const mobilePromptActions = [
  {
    icon: Landmark,
    text: "Tell me 10 interesting facts about Meghalaya's history, culture, festivals, tribes, and famous places in simple student-friendly language.",
  },
  {
    icon: GraduationCap,
    text: "Quiz me with 20 general knowledge questions about Meghalaya, including answers and short explanations.",
  },
  {
    icon: MapPinned,
    text: "Explain Meghalaya district-wise with important facts about geography, people, culture, tourism, and current development for students.",
  },
];

export default function ChatInput({ onSend, disabled, showMobilePrompts = false }) {
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
      {showMobilePrompts ? (
        <div className="mobile-prompt-list mobile-only-block">
          {mobilePromptActions.map((prompt) => (
            <button
              key={prompt.text}
              type="button"
              className="mobile-prompt-item"
              disabled={disabled}
              onClick={() => onSend({ text: prompt.text, imageFile: null })}
            >
              <prompt.icon size={16} />
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      ) : null}
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
