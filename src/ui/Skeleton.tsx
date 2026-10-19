/** A pulsing placeholder shown while content loads. */
export function Skeleton({ width = '100%', height = '1em' }: { width?: string | number; height?: string | number }) {
  return (
    <div className="skeleton" style={{ width, height }} aria-hidden="true" />
  );
}

/** A line of skeleton text. */
export function SkeletonLine({ width = '60%' }: { width?: string | number }) {
  return <Skeleton width={width} height="14px" />;
}

/** A block skeleton for cards. */
export function SkeletonBlock({ width = '100%', height = '200px' }: { width?: string | number; height?: string | number }) {
  return <Skeleton width={width} height={height} />;
}
