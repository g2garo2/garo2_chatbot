const languageOptions = [
  { value: "english", label: "English" },
  { value: "garo", label: "Garo" },
];

export default function LanguageSelector({ languageState, setLanguageState }) {
  return (
    <div className="language-grid">
      <label>
        Input language
        <select
          value={languageState.inputLanguage}
          onChange={(event) =>
            setLanguageState((prev) => ({ ...prev, inputLanguage: event.target.value }))
          }
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        Output language
        <select
          value={languageState.outputLanguage}
          onChange={(event) =>
            setLanguageState((prev) => ({ ...prev, outputLanguage: event.target.value }))
          }
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
