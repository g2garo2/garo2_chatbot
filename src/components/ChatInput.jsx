import { useEffect, useRef, useState } from "react";
import { GraduationCap, ImagePlus, Landmark, MapPinned, Send, Sparkles, X } from "lucide-react";

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

const MAX_IMAGE_SIZE_MB = 10;

export default function ChatInput({ onSend, onGenerateImage, disabled, showMobilePrompts = false, onError }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mode, setMode] = useState("chat");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "0px";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [text]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const resetImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode === "generate") {
      resetImage();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      resetImage();
      return;
    }

    if (!file.type.startsWith("image/")) {
      onError?.("Please select a valid image file.");
      resetImage();
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      onError?.(`Image must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`);
      resetImage();
      return;
    }

    setMode("chat");
    setImageFile(file);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (mode === "generate") {
      if (!text.trim()) {
        return;
      }
      await onGenerateImage?.({ prompt: text.trim() });
      setText("");
      return;
    }

    if (!text.trim() && !imageFile) return;
    await onSend({ text: text.trim() || "Please analyze this image.", imageFile });
    setText("");
    resetImage();
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
      <div className="composer-toolbar">
        <button
          type="button"
          className={`composer-mode-button ${mode === "chat" ? "active" : ""}`}
          disabled={disabled}
          onClick={() => switchMode("chat")}
        >
          <Send size={15} />
          <span>Chat</span>
        </button>
        <button
          type="button"
          className={`composer-mode-button ${mode === "generate" ? "active" : ""}`}
          disabled={disabled}
          onClick={() => switchMode("generate")}
        >
          <Sparkles size={15} />
          <span>Generate image</span>
        </button>
      </div>
      <div className="composer-row">
        <label className="upload-button">
          <ImagePlus size={18} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={disabled || mode === "generate"}
            hidden
          />
        </label>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={mode === "generate" ? "Describe the image you want to create" : "Ask anything"}
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
          {mode === "generate" ? <Sparkles size={18} /> : <Send size={18} />}
        </button>
      </div>
      {imageFile ? (
        <div className="image-pill image-pill-rich">
          {previewUrl ? <img src={previewUrl} alt={imageFile.name} className="image-pill-preview" /> : null}
          <div className="image-pill-copy">
            <strong>{imageFile.name}</strong>
            <span>Ready to upload</span>
          </div>
          <button type="button" className="image-pill-remove" onClick={resetImage} aria-label="Remove image">
            <X size={16} />
          </button>
        </div>
      ) : null}
      <p className="composer-helper">
        {mode === "generate"
          ? "Generate images from a text prompt using your plan limits."
          : "Upload JPG, PNG, WEBP, or GIF images up to 10 MB."}
      </p>
      <p className="composer-note desktop-only-block">Garo2 can make mistakes. Check important info.</p>
    </form>
  );
}
