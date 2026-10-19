/** Skeleton component for loading states. */
export function Skeleton({ width = '100%', height = '1em', className }: { width?: string | number; height?: string | number; className?: string }) {
  return (
    <div className={`skeleton${className ? ` ${className}` : ''}`} style={{ width, height }} aria-hidden="true" />
  );
}

/** Skeleton line for text loading states. */
export function SkeletonLine({ width = '60%', className }: { width?: string | number; className?: string }) {
  return <Skeleton width={width} height="14px" className={className} />;
}

/** Skeleton list for list loading states. */
export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} width={i % 3 === 0 ? '70%' : i % 2 === 0 ? '50%' : '90%'} height="16px" />
      ))}
    </div>
  );
}

/** Skeleton card for card loading states. */
export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton width="100%" height="120px" />
      <div className="skeleton-text">
        <Skeleton width="60%" height="14px" />
        <Skeleton width="40%" height="12px" />
        <Skeleton width="80%" height="12px" />
        <Skeleton width="40%" height="12px" />
      </div>
    </div>
  );
}
