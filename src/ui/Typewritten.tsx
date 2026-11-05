import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { atPause, delayAfter, prefersCalm } from './useTypewriter';

/**
 * Whatever is inside appears one letter at a time, as if typed, and a press shows the rest. It works on any content (paragraphs, lists,
 * words with a hint on them) by revealing its text where it already stands, so nothing has to be written twice. `onTalking` is told when
 * the speaker is mid-sentence and when they have finished or paused for breath: it drives the avatar's mouth.
 * The space is held from the start so the box does not grow. For a player who asked for less motion the words simply stand.
 */
export function Typewritten({ children, onTalking, className }: { children: ReactNode; onTalking?(talking: boolean): void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const tell = useRef(onTalking);
  tell.current = onTalking;
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersCalm()) { tell.current?.(false); return; }
    const texts: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) if ((n as Text).data.trim()) texts.push(n as Text);
    if (texts.length === 0) { tell.current?.(false); return; }
    const full = texts.map((x) => x.data);
    root.style.minHeight = `${root.offsetHeight}px`;
    texts.forEach((x) => { x.data = ''; });
    let node = 0, shown = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let last = '';
    const finish = () => { texts.forEach((x, i) => { x.data = full[i]; }); node = texts.length; root.style.minHeight = ''; tell.current?.(false); };
    const step = () => {
      shown += 1;
      texts[node].data = full[node].slice(0, shown);
      last += full[node][shown - 1];
      if (shown >= full[node].length) { node += 1; shown = 0; }
      if (node >= texts.length) { finish(); return; }
      tell.current?.(!atPause(last));
      timer = setTimeout(step, delayAfter(last[last.length - 1] ?? ''));
    };
    tell.current?.(true);
    timer = setTimeout(step, 250);
    const skip = () => { clearTimeout(timer); if (node < texts.length) finish(); };
    root.addEventListener('click', skip);
    return () => { clearTimeout(timer); root.removeEventListener('click', skip); texts.forEach((x, i) => { x.data = full[i]; }); root.style.minHeight = ''; tell.current?.(false); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
