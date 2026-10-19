import { useState } from 'react';
import { useT } from './hooks';
import { Icon } from './Icon';

/** Copies text to the clipboard with feedback. Falls back to a selectable input if clipboard API is unavailable. */
export function CopyButton({ text, label, size = 20 }: { text: string; label?: string; size?: number }) {
  const t = useT();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="icon-btn copy-btn" aria-label={label ?? t('copy.copy')} title={label ?? t('copy.copy')} onClick={copy}>
      {copied ? <Icon name="check" size={size} /> : <Icon name="doc" size={size} />}
      <span className="muted small">{copied ? t('copy.copied') : label ?? t('copy.copy')}</span>
    </button>
  );
}
