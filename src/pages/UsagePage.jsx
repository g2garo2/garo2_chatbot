import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage, meApi } from "../api/client";
import UsageSummary from "../components/UsageSummary";

export default function UsagePage() {
  const [usage, setUsage] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [usageData, subscriptionData] = await Promise.all([
          meApi.getUsage(),
          meApi.getSubscription(),
        ]);
        setUsage(usageData);
        setSubscription(subscriptionData);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load your usage right now."));
      }
    };

    load();
  }, []);

  return (
    <div className="settings-shell">
      <div className="settings-header">
        <div>
          <p className="section-eyebrow">Usage</p>
          <h1>Your current usage and limits</h1>
        </div>
        <div className="settings-actions">
          <Link to="/pricing" className="primary-button">
            Upgrade plan
          </Link>
          <Link to="/app" className="secondary-button">
            Back to chat
          </Link>
        </div>
      </div>

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {usage && subscription ? <UsageSummary usage={usage} subscription={subscription} /> : null}
    </div>
  );
}
