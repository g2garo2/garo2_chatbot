function labelForPlan(plan) {
  const value = String(plan || "free").toLowerCase();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PlanBadge({ plan }) {
  const normalizedPlan = String(plan || "free").toLowerCase();
  return <span className={`plan-badge plan-${normalizedPlan}`}>{labelForPlan(normalizedPlan)}</span>;
}
