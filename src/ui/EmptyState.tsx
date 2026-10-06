import type { ReactNode } from 'react';

/** The drawings for the places that have nothing to show yet, in the same line weight as the icons. */
const ART = {
  ballot: (
    <>
      <rect x="14" y="40" width="68" height="40" rx="6" /><path d="M28 40V30h40v10" /><path d="M34 22l14-12 14 12" /><path d="M40 22h16" />
      <path d="M40 58h16" />
    </>
  ),
  megaphone: (
    <>
      <path d="M14 38v20h14l34 18V20L28 38H14z" /><path d="M72 36a14 14 0 010 24" /><path d="M78 26a26 26 0 010 44" />
    </>
  ),
  paper: (
    <>
      <path d="M24 12h40l12 12v60H24z" /><path d="M64 12v14h12" /><path d="M34 44h32 M34 56h32 M34 68h20" />
    </>
  ),
  compass: (
    <>
      <circle cx="48" cy="48" r="34" /><path d="M62 34L54 54 34 62l8-20 20-8z" />
    </>
  ),
} as const;
export type Art = keyof typeof ART;

/** What a screen says when there is nothing in it yet: a small drawing, a line, and where relevant a way to put that right. */
export function EmptyState({ art, title, text, children }: { art: Art; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <svg width="96" height="96" viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ART[art]}</svg>
      <h3>{title}</h3>
      {text && <p className="muted">{text}</p>}
      {children}
    </div>
  );
}
