export default function LoadingSpinner({ centered = false, label = "Loading", className = "" }) {
  const wrapperClassName = centered ? `screen-center ${className}`.trim() : className.trim();

  return (
    <div className={wrapperClassName} role="status" aria-label={label}>
      <div className="app-loader-spinner" aria-hidden="true" />
    </div>
  );
}
