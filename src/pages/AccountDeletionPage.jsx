import { useEffect, useState } from "react";
import { accountDeletionApi, getApiErrorMessage } from "../api/client";
import SettingsHeader from "../components/SettingsHeader";
import { useAuth } from "../context/AuthContext";

export default function AccountDeletionPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    reason: "",
    confirmed: false,
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
    const { name, type, value, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.confirmed) {
      setError("Please confirm that you understand the account deletion request.");
      setSuccess("");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await accountDeletionApi.createRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        reason: form.reason.trim(),
      });
      setSuccess("Your account deletion request has been submitted.");
      setForm((current) => ({
        ...current,
        reason: "",
        confirmed: false,
      }));
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "Could not submit your deletion request right now."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-shell legal-page-shell">
      <SettingsHeader backTo="/settings" title="Account" />

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {success ? <div className="success-banner settings-banner">{success}</div> : null}

      <article className="settings-card legal-content-card">
        <p className="legal-lead">
          Submit this form if you want the Garo2 team to review your account for deletion.
        </p>

        <form className="account-deletion-form" onSubmit={handleSubmit}>
          <label className="account-deletion-field">
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

          <label className="account-deletion-field">
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

          <label className="account-deletion-field">
            <span>Reason for deletion</span>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Tell us why you want to delete your account"
              rows={6}
              required
            />
          </label>

          <label className="account-deletion-checkbox">
            <input
              type="checkbox"
              name="confirmed"
              checked={form.confirmed}
              onChange={handleChange}
              required
            />
            <span>I understand that my account and related data may be permanently deleted.</span>
          </label>

          <div className="settings-actions">
            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </div>
        </form>
      </article>
    </div>
  );
}
