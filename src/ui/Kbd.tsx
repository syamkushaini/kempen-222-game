/** A key the player can press: shown in a small box next to a button or in text. */
export function Kbd({ shortcut }: { shortcut: string }) {
  return <kbd className="kbd">{shortcut}</kbd>;
}
