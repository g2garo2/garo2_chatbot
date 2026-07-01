import { useNavigate } from "react-router-dom";

export default function UpgradePrompt({
  compact = false,
  message = "You have reached your limit for this plan. Upgrade your plan to continue.",
  onClose,
}) {
  const navigate = useNavigate();

  return (
    <div className={`upgrade-prompt ${compact ? "compact" : ""}`}>
      {!compact ? (
        <button type="button" className="upgrade-prompt-close" onClick={onClose} aria-label="Close upgrade popup">
          ×
        </button>
      ) : null}
      <p>{message}</p>
      <button type="button" className="primary-button" onClick={() => navigate("/pricing")}>
        Upgrade plan
      </button>
    </div>
  );
}
