/** Progress indicator for long-running operations. */
export function ProgressIndicator({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>{label}</span>
        <span className="num">{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
}
