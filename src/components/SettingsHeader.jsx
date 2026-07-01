import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function SettingsHeader({ backTo, title }) {
  return (
    <header className="settings-static-header">
      <Link to={backTo} className="settings-back-button" aria-label="Go back">
        <ArrowLeft size={18} />
      </Link>

      <h1 className="settings-static-header-title">{title}</h1>

      <div className="settings-header-spacer" aria-hidden="true" />
    </header>
  );
}
