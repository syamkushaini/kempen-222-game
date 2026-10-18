import type { ReactNode } from 'react';

/** A part of a screen that is there for those who want it and out of the way for those who do not. */
export function Fold({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="fold" open={open}>
      <summary>{title}</summary>
      <div className="fold-body">{children}</div>
    </details>
  );
}
