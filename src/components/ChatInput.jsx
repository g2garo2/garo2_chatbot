import { useState } from "react";
import { ImagePlus, Send } from "lucide-react";
import LanguageSelector from "./LanguageSelector";

export default function ChatInput({ languageState, setLanguageState, onSend, disabled }) {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const submit = async (event) => {
    event.preventDefault();
    if (!text.trim() && !imageFile) return;
    await onSend({ text: text.trim() || "Please analyze this image.", imageFile });
    setText("");
    setImageFile(null);
  };

  return (
    <form className="composer" onSubmit={submit}>
      <LanguageSelector languageState={languageState} setLanguageState={setLanguageState} />
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
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type in English or Garo..."
          rows={1}
          disabled={disabled}
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
    </form>
  );
}
