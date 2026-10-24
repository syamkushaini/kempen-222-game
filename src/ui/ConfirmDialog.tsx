import { useT } from './hooks';
import { DialogFocus } from './dialog';

/** Reusable confirmation dialog for destructive or important actions. */
export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, cancelLabel }: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const t = useT();
  if (!open) return null;
  return (
    <DialogFocus open={open} onClose={onClose} className="panel confirm-dialog" role="dialog" aria-modal="true" aria-label={title}>
      <div className="panel-head">
        <h3>{title}</h3>
        <button className="btn small" onClick={onClose}>{t('dialog.close')}</button>
      </div>
      <p>{body}</p>
      <div className="button-row">
        <button className="btn" onClick={onClose}>{cancelLabel ?? t('dialog.close')}</button>
        <button className="btn primary destructive" onClick={onConfirm}>{confirmLabel ?? t('actions.go')}</button>
      </div>
    </DialogFocus>
  );
}
