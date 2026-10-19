import { useDialogFocus, useFocusTrap } from './hooks';

/** Wraps a dialog panel: when the dialog opens focus moves into it, and when it closes focus returns
 * to whatever was focused before. Tab cycles inside the panel so the keyboard never escapes it. */
export function DialogFocus({ open, onClose, children, className, role, 'aria-label': ariaLabel }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  role?: string;
  'aria-label'?: string;
}) {
  const { dialogRef } = useDialogFocus(open, onClose);
  useFocusTrap(dialogRef, open);
  return (
    <div ref={dialogRef} className={className} tabIndex={-1} role={role} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
