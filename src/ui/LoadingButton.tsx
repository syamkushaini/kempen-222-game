/** Button that shows a spinner while loading. Disables while loading. */
export function LoadingButton({ loading, disabled, children, ...props }: { loading?: boolean; disabled?: boolean; children: React.ReactNode; [key: string]: any }) {
  const isDisabled = disabled || loading || false;
  return (
    <button className={`btn${loading ? ' loading' : ''}${isDisabled ? ' disabled' : ''}`} disabled={isDisabled} {...props}>
      {loading ? <span className="btn-loading"><span className="btn-spinner"></span></span> : null}
      {children}
    </button>
  );
}
