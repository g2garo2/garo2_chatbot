import { Link } from "react-router-dom";
import SettingsHeader from "../components/SettingsHeader";

const SETTINGS_LINKS = [
  {
    to: "/feedback",
    eyebrow: "Feedback",
    title: "Feedback",
    description: "Send suggestions, bug reports, or general feedback directly to the Garo2 admin team.",
  },
  {
    to: "/privacy-policy",
    eyebrow: "Privacy",
    title: "Privacy Policy",
    description: "Read how Garo2 collects, stores, and uses account, chat, translation, and subscription data.",
  },
  {
    to: "/terms-and-conditions",
    eyebrow: "Terms",
    title: "Terms & Conditions",
    description: "Review the rules for using Garo2, subscriptions, AI output, and account responsibilities.",
  },
  {
    to: "/account-deletion",
    eyebrow: "Account",
    title: "Account Deletion",
    description: "Submit an account deletion request for manual review by the Garo2 admin team.",
  },
];

export default function SettingsPage() {
  return (
    <div className="settings-shell">
      <SettingsHeader
        backTo="/app"
        eyebrow="Settings"
        title="Privacy, terms, feedback, and account controls"
      />

      <section className="settings-links-grid">
        {SETTINGS_LINKS.map((item) => (
          <article key={item.to} className="settings-card settings-link-card">
            <p className="section-eyebrow">{item.eyebrow}</p>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <Link to={item.to} className="primary-button">
              Read more
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
