import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getApiErrorMessage, meApi } from "../api/client";
import SettingsHeader from "../components/SettingsHeader";
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
      <SettingsHeader backTo="/app" title="Usage" />

      <div className="settings-actions usage-page-actions">
        <Link to="/pricing" className="primary-button">
          Upgrade plan
        </Link>
      </div>

      {error ? <div className="error-banner settings-banner">{error}</div> : null}
      {usage && subscription ? <UsageSummary usage={usage} subscription={subscription} /> : null}
    </div>
  );
}
