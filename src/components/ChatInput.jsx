import { useEffect, useRef, useState } from "react";
import { GraduationCap, Landmark, Languages, MapPinned, Plus, Send, X } from "lucide-react";

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

const promptIcons = [Landmark, GraduationCap, MapPinned];

export default function ChatInput({
  onSend,
  onTranslate,
  disabled,
  showMobilePrompts = false,
  promptSuggestions = [],
}) {
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState("chat");
  const [translationMode, setTranslationMode] = useState(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [text]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    if (mode === "translate") {
      await onTranslate?.({ text: text.trim(), translationMode });
    } else {
      await onSend({ text: text.trim() });
    }
    setText("");
  };
  const translationLabel =
    translationMode === "english_to_garo"
      ? "Translate English to Garo"
      : translationMode === "garo_to_english"
        ? "Translate Garo to English"
        : "";
  const resolvedPromptActions = (promptSuggestions.length ? promptSuggestions : mobilePromptActions.map((prompt) => prompt.text)).map(
    (text, index) => ({
      icon: promptIcons[index] || Landmark,
      text,
    }),
  );

  return (
    <form className="composer" onSubmit={submit}>
      {showMobilePrompts ? (
        <div className="mobile-prompt-list mobile-only-block">
          {resolvedPromptActions.map((prompt) => (
            <button
              key={prompt.text}
              type="button"
              className="mobile-prompt-item"
              disabled={disabled}
              onClick={() =>
                mode === "translate"
                  ? onTranslate?.({ text: prompt.text, translationMode })
                  : onSend({ text: prompt.text })
              }
            >
              <prompt.icon size={16} />
              <span>{prompt.text}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className="composer-row">
        <div className="composer-plus-wrap" ref={menuRef}>
          <button
            type="button"
            className={`composer-plus-button ${menuOpen ? "active" : ""}`}
            disabled={disabled}
            aria-label="Open input tools"
            title="Open input tools"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={18} /> : <Plus size={18} />}
          </button>
            {menuOpen ? (
            <div className="composer-menu">
              <button
                type="button"
                className={`composer-menu-item ${translationMode === "english_to_garo" ? "active" : ""}`}
                onClick={() => {
                  setMode("translate");
                  setTranslationMode("english_to_garo");
                  setMenuOpen(false);
                }}
              >
                <Languages size={16} />
                <span>Translate English to Garo</span>
              </button>
              <button
                type="button"
                className={`composer-menu-item ${translationMode === "garo_to_english" ? "active" : ""}`}
                onClick={() => {
                  setMode("translate");
                  setTranslationMode("garo_to_english");
                  setMenuOpen(false);
                }}
              >
                <Languages size={16} />
                <span>Translate Garo to English</span>
              </button>
              {mode === "translate" ? (
                <button
                  type="button"
                  className="composer-menu-item"
                  onClick={() => {
                    setMode("chat");
                    setTranslationMode(null);
                    setMenuOpen(false);
                  }}
                >
                  <Send size={16} />
                  <span>Back to chat</span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={mode === "translate" ? `Type text for ${translationLabel}` : "Ask anything"}
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
      {mode === "translate" ? (
        <div className="composer-mode-hint">
          <Languages size={14} />
          <span>{translationLabel} mode is on.</span>
        </div>
      ) : null}
      <p className="composer-note desktop-only-block">Garo2 can make mistakes. Check important info.</p>
    </form>
  );
}
