import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsHeader({ backTo, eyebrow, title }) {
  return (
    <header className="settings-static-header">
      <Link to={backTo} className="settings-back-button" aria-label="Go back">
        <ArrowLeft size={18} />
      </Link>

      <div className="settings-static-header-copy">
        <p className="section-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
    </header>
  );
}
