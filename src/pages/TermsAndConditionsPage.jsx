import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "User responsibilities",
    paragraphs: [
      "You are responsible for providing accurate account information, keeping your login access secure, and using Garo2 in a lawful and respectful way.",
      "You should review generated content before relying on it for personal, legal, financial, medical, or other important decisions.",
    ],
  },
  {
    title: "Subscriptions and billing",
    paragraphs: [
      "Paid features depend on your current subscription plan, payment status, and any backend usage limits configured by Garo2.",
      "Subscription prices, limits, and plan text may change over time.",
    ],
  },
  {
    title: "Allowed and prohibited usage",
    paragraphs: [
      "You may use Garo2 for normal chat, translation, and supported product features made available under your plan.",
      "You must not misuse the service for abuse, spam, fraud, harmful content, unauthorized access attempts, or activity that disrupts the platform.",
    ],
  },
  {
    title: "AI response limitations",
    paragraphs: [
      "AI-generated responses can be incomplete, incorrect, biased, or outdated. Garo2 does not guarantee that every answer is accurate or fit for every purpose.",
      "You remain responsible for checking important outputs and using human judgment where needed.",
    ],
  },
  {
    title: "Service availability and account rules",
    paragraphs: [
      "Garo2 may update, pause, limit, or improve parts of the service for maintenance, security, provider changes, abuse prevention, or operational reasons.",
      "Accounts may be restricted, suspended, or reviewed if usage violates these terms, payment requirements, or platform safety rules.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="settings-shell legal-page-shell">
      <div className="settings-header">
        <div>
          <p className="section-eyebrow">Legal</p>
          <h1>Terms &amp; Conditions</h1>
        </div>
        <div className="settings-actions">
          <Link to="/settings" className="secondary-button">
            Back to settings
          </Link>
          <Link to="/app" className="secondary-button">
            Back to home
          </Link>
        </div>
      </div>

      <article className="settings-card legal-content-card">
        <p className="legal-lead">
          These terms outline your responsibilities, subscription rules, permitted use, and important
          limitations when using Garo2.
        </p>

        {SECTIONS.map((section) => (
          <section key={section.title} className="legal-section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
