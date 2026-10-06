import { useState } from 'react';
import { useT } from './hooks';
import { Jargon } from './Term';

/** A paragraph of help that shows its first sentence and keeps the rest a tap away. A single sentence shows whole. */
export function Brief({ text, className = 'muted small', jargon }: { text: string; className?: string; jargon?: boolean }) {
  const t = useT();
  const [more, setMore] = useState(false);
  const cut = text.search(/[.!?]\s/);
  const short = cut < 0 ? text : text.slice(0, cut + 1);
  const rest = cut < 0 ? '' : text.slice(cut + 2);
  const show = (s: string) => (jargon ? <Jargon>{s}</Jargon> : s);
  return (
    <p className={className}>
      {show(more || !rest ? text : short)}
      {rest && <> <button type="button" className="link" aria-expanded={more} onClick={() => setMore((v) => !v)}>{t(more ? 'brief.less' : 'brief.more')}</button></>}
    </p>
  );
}
