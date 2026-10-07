import { useEffect, useRef, useState } from 'react';
import { useT } from './hooks';

interface Head { text: string; el: HTMLElement }

/**
 * On a phone a long tab is a long scroll. This is a row of its headings, kept in reach at the top: a press takes the
 * page to that part. It reads the headings from the tab itself, so no tab has to list its own; a tab with only one or
 * two parts shows nothing.
 */
export function SectionJump({ watch }: { watch: string }) {
  const t = useT();
  const self = useRef<HTMLDivElement>(null);
  const [heads, setHeads] = useState<Head[]>([]);
  useEffect(() => {
    const body = self.current?.parentElement;
    if (!body) return;
    const find = () => setHeads([...body.querySelectorAll<HTMLElement>('h3')]
      .filter((el) => el.offsetParent !== null)
      // A heading may carry a note after its name ("· week 3"): the name is its first piece of text.
      .map((el) => ({ el, text: ([...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())?.textContent ?? el.textContent ?? '').trim() }))
      .filter((h) => h.text.length > 0));
    find();
    // Tabs that fetch or fold settle a moment after they open.
    const id = setTimeout(find, 350);
    return () => clearTimeout(id);
  }, [watch]);
  const calm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (
    <div ref={self} className={heads.length >= 3 ? 'section-jump chips' : undefined} hidden={heads.length < 3} role="navigation" aria-label={t('jump.label')}>
      {heads.length >= 3 && heads.map((h, i) => (
        <button key={i} className="chip" onClick={() => { const d = h.el.closest('details'); if (d) d.open = true; h.el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' }); }}>{h.text}</button>
      ))}
    </div>
  );
}
