import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { feedbackApi, getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";

const FEEDBACK_TYPES = [
  { value: "general", label: "General feedback" },
  { value: "suggestion", label: "Suggestion" },
  { value: "bug", label: "Bug report" },
];

export default function FeedbackPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    feedbackType: "general",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm((current) => ({
      ...current,
      name: current.name || user?.name || "",
      email: current.email || user?.email || "",
    }));
  }, [user?.email, user?.name]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await feedbackApi.createRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        feedback_type: form.feedbackType,
        message: form.message.trim(),
      });
      setSuccess("Your feedback has been submitted.");
      setForm((current) => ({
        ...current,
        feedbackType: "general",
        message: "",
      }));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Could not submit your feedback right now."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-shell legal-page-shell">
      <div className="settings-header">
        <div>
          <p className="section-eyebrow">Feedback</p>
          <h1>Send feedback</h1>
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

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {success ? <div className="success-banner settings-banner">{success}</div> : null}

      <article className="settings-card legal-content-card">
        <p className="legal-lead">
          Share feedback, suggestions, or bug reports with the Garo2 team from here.
        </p>

        <form className="feedback-form" onSubmit={handleSubmit}>
          <label className="feedback-field">
            <span>Name</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              required
            />
          </label>

          <label className="feedback-field">
            <span>Registered email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </label>

          <label className="feedback-field">
            <span>Feedback type</span>
            <select name="feedbackType" value={form.feedbackType} onChange={handleChange}>
              {FEEDBACK_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="feedback-field">
            <span>Message</span>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us what you want to improve, report, or suggest"
              rows={6}
              required
            />
          </label>

          <div className="settings-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit feedback"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
