/** The small line icons the interface uses, drawn on a 24-point grid. They are never the only label: a word or a name goes with each. */
const PATHS = {
  flag: 'M5 21V4 M5 4h11l-2 4 2 4H5',
  landmark: 'M3 10l9-6 9 6 M5 10v8 M9 10v8 M15 10v8 M19 10v8 M3 21h18',
  people: 'M9 11a3 3 0 100-6 3 3 0 000 6z M3 20c0-3 3-5 6-5s6 2 6 5 M16 11a3 3 0 100-6 M17 15c2.5.4 4 2.2 4 5',
  intel: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  sun: 'M12 16a4 4 0 100-8 4 4 0 000 8z M12 2v2 M12 20v2 M4.9 4.9l1.4 1.4 M17.7 17.7l1.4 1.4 M2 12h2 M20 12h2 M4.9 19.1l1.4-1.4 M17.7 6.3l1.4-1.4',
  moon: 'M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z',
  auto: 'M12 3a9 9 0 100 18 9 9 0 000-18z M12 3v18',
  sliders: 'M4 7h9 M17 7h3 M4 12h3 M11 12h9 M4 17h11 M19 17h1 M15 5v4 M9 10v4 M17 15v4',
  speaker: 'M4 9v6h4l5 4V5L8 9H4z M16.5 9a4 4 0 010 6 M19 6.5a8 8 0 010 11',
  muted: 'M4 9v6h4l5 4V5L8 9H4z M17 9l5 6 M22 9l-5 6',
  music: 'M9 18V5l11-2v13 M9 18a3 3 0 11-3-3 3 3 0 013 3z M20 16a3 3 0 11-3-3 3 3 0 013 3z',
  inbox: 'M3 13l3-8h12l3 8 M3 13v6h18v-6 M3 13h5l1 2h6l1-2h5',
  thumbUp: 'M7 11v9H4v-9h3z M7 11l4-7c1.5 0 2.5 1 2.5 2.5V9h5a2 2 0 012 2.3l-1 6A2 2 0 0117.5 19H7',
  thumbDown: 'M7 13V4H4v9h3z M7 13l4 7c1.5 0 2.5-1 2.5-2.5V15h5a2 2 0 002-2.3l-1-6A2 2 0 0017.5 5H7',
  ballot: 'M3 14h18v6H3z M7 14V9l5-5 5 5v5 M10 9h4',
  megaphone: 'M3 10v4h3l8 4V6L6 10H3z M17 9a4 4 0 010 6',
  compass: 'M12 21a9 9 0 100-18 9 9 0 000 18z M15.5 8.5l-2 5-5 2 2-5 5-2z',
  play: 'M7 4.5v15l12-7.5-12-7.5z',
  plus: 'M12 5v14 M5 12h14',
  folder: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
  trophy: 'M8 4h8v5a4 4 0 01-8 0V4z M8 6H5a3 3 0 003 4 M16 6h3a3 3 0 01-3 4 M12 13v4 M8 20h8 M10 17h4',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18z M12 16a4 4 0 100-8 4 4 0 000 8z M12 12h.01',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z M4 19a2 2 0 012-2h13 M9 7h6',
  crown: 'M4 18h16 M4 18L3 8l5 4 4-7 4 7 5-4-1 10',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6z M19 12a7 7 0 00-.1-1.3l2-1.5-2-3.4-2.3 1a7 7 0 00-2.3-1.3L14 3h-4l-.3 2.5a7 7 0 00-2.3 1.3l-2.3-1-2 3.4 2 1.5a7 7 0 000 2.6l-2 1.5 2 3.4 2.3-1a7 7 0 002.3 1.3L10 21h4l.3-2.5a7 7 0 002.3-1.3l2.3 1 2-3.4-2-1.5A7 7 0 0019 12z',
  back: 'M15 5l-7 7 7 7',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chevron: 'M9 5l7 7-7 7',
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name].split(' M').map((d, i) => <path key={i} d={i === 0 ? d : `M${d}`} />)}
    </svg>
  );
}
