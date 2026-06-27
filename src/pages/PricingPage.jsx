import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PlanBadge from "../components/PlanBadge";
import RazorpayCheckoutButton from "../components/RazorpayCheckoutButton";

const plans = [
  {
    key: "free",
    label: "Free",
    price: "Rs 0",
    chat: "Unlimited with safe backend rate limit",
    translation: "8/day",
    imageUpload: "3/day",
    imageGeneration: "1/month trial",
    provider: "Chat uses OpenRouter free model. Translation and image features use Gemini.",
  },
  {
    key: "plus",
    label: "Plus",
    price: "Rs 100/month",
    chat: "40/day",
    translation: "40/day",
    imageUpload: "15/day",
    imageGeneration: "5/month",
    provider: "All features use Gemini.",
  },
  {
    key: "pro",
    label: "Pro",
    price: "Rs 299/month",
    chat: "120/day",
    translation: "120/day",
    imageUpload: "45/day",
    imageGeneration: "20/month",
    provider: "All features use Gemini.",
  },
  {
    key: "ultra",
    label: "Ultra",
    price: "Rs 1099/month",
    chat: "500/day",
    translation: "500/day",
    imageUpload: "100/day",
    imageGeneration: "150/month",
    provider: "All features use Gemini.",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPlan = useMemo(() => String(user?.plan || "free").toLowerCase(), [user?.plan]);

  return (
    <div className="settings-shell">
      <div className="settings-header">
        <div>
          <p className="section-eyebrow">Plans</p>
          <h1>Choose the right Garo2 plan</h1>
        </div>
        <div className="settings-actions">
          <PlanBadge plan={currentPlan} />
          <Link to="/app" className="secondary-button">
            Back to chat
          </Link>
        </div>
      </div>

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {success ? <div className="success-banner settings-banner">{success}</div> : null}

      <section className="pricing-grid">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          return (
            <article key={plan.key} className={`pricing-card ${isCurrent ? "current" : ""}`}>
              <div className="pricing-card-top">
                <div>
                  <p className="section-eyebrow">{plan.label}</p>
                  <h2>{plan.price}</h2>
                </div>
                {isCurrent ? <PlanBadge plan={plan.key} /> : null}
              </div>

              <div className="pricing-metrics">
                <p>Chat/day: {plan.chat}</p>
                <p>Translation/day: {plan.translation}</p>
                <p>Image uploads/day: {plan.imageUpload}</p>
                <p>Image generation/month: {plan.imageGeneration}</p>
                <p>AI provider: {plan.provider}</p>
              </div>

              {plan.key === "free" ? (
                <button type="button" className="secondary-button" disabled>
                  Included by default
                </button>
              ) : isCurrent ? (
                <button type="button" className="secondary-button" disabled>
                  Current plan
                </button>
              ) : (
                <RazorpayCheckoutButton
                  plan={plan.key}
                  label={plan.label}
                  onSuccess={() => {
                    setError("");
                    setSuccess(`Your ${plan.label} payment was verified and the plan is now active.`);
                  }}
                  onError={(message) => {
                    setSuccess("");
                    setError(message);
                  }}
                />
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
