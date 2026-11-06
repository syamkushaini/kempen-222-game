import { ground, luminance, mix } from './shareCard';

/** The contrast between two colours, as WCAG measures it. */
const contrast = (a: string, b: string): number => {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const NAMES = ['--primary', '--primary-hover', '--primary-focus', '--on-primary', '--link', '--ring', '--party'];

/** Whether the screen is drawn dark: the theme the player chose, or the one the system asks for. */
export const isDark = (scheme: string | null): boolean => {
  const set = typeof document === 'undefined' ? undefined : document.documentElement.dataset.theme;
  if (set === 'dark' || set === 'light') return set === 'dark';
  return scheme === 'dark' || (scheme !== 'light' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
};

/**
 * Makes a colour the colour of the interface: the buttons, the active tab, the focus ring and, through them, the glow behind every screen. On a dark
 * screen the colour is lifted until it stands out from the background and carries dark or white text, whichever reads better; on a light one it is
 * deepened until white text reads on it. `party` is the party's own colour, kept as data. With no colour the template's green (theme.css) is left alone.
 */
export function applyAccent(color: string | null, dark: boolean, party: string | null = null): void {
  const root = document.documentElement;
  if (!color) { for (const n of NAMES) root.style.removeProperty(n); return; }
  let base = color;
  if (dark) { for (let i = 0; i < 8 && luminance(base) < 0.22; i++) base = mix(base, '#ffffff', 0.15); }
  else base = ground(color)[0];
  const text = contrast(base, '#ffffff') >= contrast(base, '#052e16') ? '#ffffff' : '#052e16';
  root.style.setProperty('--primary', base);
  root.style.setProperty('--primary-hover', dark ? mix(base, '#ffffff', 0.15) : mix(base, '#000000', 0.15));
  root.style.setProperty('--primary-focus', dark ? mix(base, '#000000', 0.15) : mix(base, '#000000', 0.3));
  root.style.setProperty('--on-primary', text);
  root.style.setProperty('--link', base);
  root.style.setProperty('--ring', `color-mix(in srgb, ${base} 70%, ${dark ? '#ffffff' : '#000000'})`);
  if (party) root.style.setProperty('--party', party); else root.style.removeProperty('--party');
}
