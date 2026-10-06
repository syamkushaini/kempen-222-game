import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useStore } from '../state/store';
import { findTerms, GLOSSARY, type TermId } from './glossary';
import { useT } from './hooks';

const SEEN_KEY = 'k222.terms';
/** Only one word explains itself unprompted at a time, however many appear together. */
let speaking = false;

function seenTerms(): string[] {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]') as string[]; } catch { return []; }
}
function markSeen(id: string) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify([...new Set([...seenTerms(), id])])); } catch { /* the explanation just comes again */ }
}

/** A word with a dotted underline that explains itself on hover, focus or tap. */
export function Term({ id, children }: { id: TermId; children: ReactNode }) {
  const t = useT();
  const tip = useId();
  const ref = useRef<HTMLButtonElement>(null);
  const [at, setAt] = useState<{ left: number; top: number } | null>(null);

  const show = () => {
    const box = ref.current?.getBoundingClientRect();
    // Larger text zooms the page, which would scale a fixed position a second time.
    const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
    if (box) setAt({ left: Math.max(8, Math.min(box.left / zoom, window.innerWidth / zoom - 280)), top: box.bottom / zoom + 6 });
  };
  const hide = () => { speaking = false; setAt(null); };
  const hints = useStore((s) => s.settings.hints);
  // The first time a word is met, it explains itself once, then keeps quiet unless pointed at.
  useEffect(() => {
    if (!hints || speaking || seenTerms().includes(id)) return;
    const open = setTimeout(() => {
      if (speaking) return;
      speaking = true;
      markSeen(id);
      show();
    }, 700);
    return () => clearTimeout(open);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!at || !speaking) return;
    const close = setTimeout(hide, 7000);
    return () => clearTimeout(close);
  }, [at]);
  // A tap focuses the word, which opens it, before its click arrives: only a press on a word already open closes it.
  const wasOpen = useRef(false);

  return (
    <>
      <button
        ref={ref} type="button" className="gloss" aria-describedby={at ? tip : undefined}
        onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}
        onPointerDown={() => { wasOpen.current = at !== null; }}
        onClick={(e) => ((e.detail === 0 ? at : wasOpen.current) ? hide() : show())} onKeyDown={(e) => { if (e.key === 'Escape') hide(); }}
      >
        {children}
      </button>
      {at && <span id={tip} role="tooltip" className="term-tip" style={at}>{t(GLOSSARY[id].text)}</span>}
    </>
  );
}

/** A sentence in which the words a newcomer may not know can be pointed at for an explanation. */
export function Jargon({ children }: { children: string }) {
  const lang = useStore((s) => s.settings.lang);
  return <>{findTerms(children, lang).map((p, i) => (p.term ? <Term key={i} id={p.term}>{p.text}</Term> : p.text))}</>;
}
