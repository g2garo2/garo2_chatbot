export default function NetworkIssuePopup({ open, onClose, onRetry }) {
  if (!open) {
    return null;
  }

  return (
    <div className="network-popup-overlay" role="alertdialog" aria-modal="true" aria-labelledby="network-popup-title">
      <div className="network-popup">
        <h2 id="network-popup-title">Check your network connection</h2>
        <p>Please check your network connection and try again.</p>
        <div className="network-popup-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="primary-button" onClick={onRetry}>
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}
