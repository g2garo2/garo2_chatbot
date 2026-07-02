import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage, plansApi } from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../context/AuthContext";
import PlanBadge from "../components/PlanBadge";
import RazorpayCheckoutButton from "../components/RazorpayCheckoutButton";
import SettingsHeader from "../components/SettingsHeader";

export default function PricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentPlan = useMemo(() => String(user?.plan || "free").toLowerCase(), [user?.plan]);

  useEffect(() => {
    let active = true;

    const loadPlans = async () => {
      setLoading(true);
      try {
        const data = await plansApi.getPublicPlans();
        if (!active) {
          return;
        }
        setPlans(data);
      } catch (fetchError) {
        if (!active) {
          return;
        }
        setError(getApiErrorMessage(fetchError, "Could not load pricing plans."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (plan) => {
    const suffix = plan.price > 0 && plan.billing_cycle && plan.billing_cycle !== "free" ? `/${plan.billing_cycle}` : "";
    return `Rs ${plan.price}${suffix}`;
  };

  return (
    <div className="settings-shell">
      <SettingsHeader backTo="/app" title="Plans" />

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {success ? <div className="success-banner settings-banner">{success}</div> : null}
      {loading ? (
        <div className="settings-loader-wrap">
          <LoadingSpinner label="Loading plans" />
        </div>
      ) : null}

      <section className="pricing-grid">
        {plans.map((plan) => {
          const isCurrent = plan.plan_key === currentPlan;
          return (
            <article key={plan.plan_key} className={`pricing-card ${isCurrent ? "current" : ""}`}>
              <div className="pricing-card-top">
                <div>
                  <p className="section-eyebrow">{plan.name}</p>
                  <h2>{formatPrice(plan)}</h2>
                </div>
                {isCurrent ? <PlanBadge plan={plan.plan_key} /> : null}
              </div>

              <div className="pricing-metrics">
                <p>Chat/day: {plan.chat_limit == null ? "Unlimited with safe backend rate limit" : `${plan.chat_limit}/day`}</p>
                <p>Translation/day: {plan.translation_limit}/day</p>
                <p>AI provider: {plan.ai_provider}</p>
              </div>

              {plan.plan_key === "free" ? (
                <button type="button" className="secondary-button" disabled>
                  Included by default
                </button>
              ) : isCurrent ? (
                <button type="button" className="secondary-button" disabled>
                  Current plan
                </button>
              ) : (
                <RazorpayCheckoutButton
                  plan={plan.plan_key}
                  label={plan.name}
                  buttonText={plan.button_text || `Pay for ${plan.name}`}
                  onSuccess={() => {
                    setError("");
                    setSuccess(`Your ${plan.name} payment was verified and the plan is now active.`);
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
