import PlanBadge from "./PlanBadge";

function formatLimit(limit) {
  return limit == null ? "Unlimited" : limit;
}

function UsageRow({ label, usage, period }) {
  return (
    <div className="usage-row">
      <div>
        <strong>{label}</strong>
        <span>{period}</span>
      </div>
      <div className="usage-values">
        <strong>{usage.used}</strong>
        <span>/ {formatLimit(usage.limit)}</span>
        <em>{usage.remaining == null ? "No fixed cap" : `${usage.remaining} left`}</em>
      </div>
    </div>
  );
}

export default function UsageSummary({ usage, subscription }) {
  return (
    <section className="settings-card usage-summary-card">
      <div className="usage-summary-header">
        <div>
          <p className="section-eyebrow">Current plan</p>
          <h2>{subscription?.plan_label || "Free"}</h2>
        </div>
        <PlanBadge plan={usage?.plan || subscription?.plan || "free"} />
      </div>

      <div className="usage-grid">
        <UsageRow label="Chat" usage={usage.chat} period="Today" />
        <UsageRow label="Translation" usage={usage.translation} period="Today" />
      </div>
    </section>
  );
}
