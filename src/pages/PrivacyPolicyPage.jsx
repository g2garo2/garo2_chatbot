import { Link } from "react-router-dom";

const SECTIONS = [
  {
    title: "Information we collect",
    paragraphs: [
      "Garo2 may collect your name, email address, and login information when you sign in or create an account.",
      "We also store chat history, translation activity, and subscription or payment records that are required to run your plan and support the service.",
    ],
  },
  {
    title: "How we use your information",
    paragraphs: [
      "Your account information is used to authenticate you, personalize your workspace, manage subscriptions, and provide access to plan-based features.",
      "Chat history and translation activity are used to deliver responses, maintain conversation continuity, improve reliability, and monitor plan usage limits.",
    ],
  },
  {
    title: "Payments and subscriptions",
    paragraphs: [
      "Payment and subscription data is used to verify purchases, activate plans, prevent fraud, and maintain billing records.",
      "Sensitive payment processing is handled through approved payment providers such as Razorpay.",
    ],
  },
  {
    title: "Data access and retention",
    paragraphs: [
      "Garo2 may retain account, chat, translation, and billing records for operational, support, compliance, and security purposes.",
      "If you want your account reviewed for deletion, you can submit a request from the Account Deletion page.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="settings-shell legal-page-shell">
      <div className="settings-header">
        <div>
          <p className="section-eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
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
          This page explains how Garo2 collects and uses name, email, login information, chat history,
          translation activity, and subscription or payment data.
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
