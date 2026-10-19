/** A determinate progress bar shown during long-running operations (save, load, export). */
export function ProgressIndicator({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="progress-bar">
        <div style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
      </div>
    </div>
  );
}
