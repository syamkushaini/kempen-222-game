/**
 * The result card: one image that sums up an election night or a career,
 * drawn on a canvas so it can be saved or shared. Everything on it comes from
 * `CardData`; nothing here knows about the game.
 */
export interface CardData {
  /** The player's party colour. */
  accent: string;
  /** Small line above the headline: the contest and the party. */
  kicker: string;
  headline: string;
  /** A sentence under the headline. */
  body?: string;
  /** Up to four figures along the bottom. */
  stats: { label: string; value: string }[];
  /** A chamber of seats, one colour per seat from left to right, with a line of text under it. */
  chamber?: { seats: string[]; caption: string };
  /** Shares of the vote, for a contest with one seat. */
  bars?: { label: string; share: number; color: string }[];
  /** A portrait, as an image address, with a name under it and a line under that. */
  portrait?: { src: string; caption: string; sub: string };
  /** Colours for the bunting along the top. */
  flags: string[];
  tagline: string;
  fiction: string;
}

export const CARD_W = 1200, CARD_H = 630;
const PAPER = '#f7f2e8', INK = '#1b2330', MUTED = '#6b7280', BRAND = '#b7791f';
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export interface Dot { x: number; y: number }

/**
 * Where the seats of a chamber sit: rows of a half circle, more seats in the
 * outer rows, returned from the far left round to the far right. Coordinates
 * are in units of the outer radius, with the centre of the circle at 0,0 and
 * y upwards. `r` is the radius a seat can be drawn at without touching another.
 */
export function hemicycle(n: number): { dots: Dot[]; r: number } {
  if (n <= 0) return { dots: [], r: 0 };
  const rows = n > 150 ? 8 : n > 70 ? 6 : n > 30 ? 4 : n > 8 ? 3 : n > 3 ? 2 : 1;
  const inner = 0.4;
  const radii = Array.from({ length: rows }, (_, i) => (rows === 1 ? 0.8 : inner + ((1 - inner) * i) / (rows - 1)));
  const total = radii.reduce((a, b) => a + b, 0);
  const counts = radii.map((r) => Math.floor((n * r) / total));
  // Seats lost to rounding go to the outer rows, which have the room.
  for (let i = rows - 1, left = n - counts.reduce((a, b) => a + b, 0); left > 0; i = (i - 1 + rows) % rows, left--) counts[i]++;
  const placed: (Dot & { angle: number; row: number })[] = [];
  counts.forEach((count, row) => {
    for (let j = 0; j < count; j++) {
      const angle = count === 1 ? Math.PI / 2 : Math.PI * (1 - j / (count - 1));
      placed.push({ x: radii[row] * Math.cos(angle), y: radii[row] * Math.sin(angle), angle, row });
    }
  });
  placed.sort((a, b) => b.angle - a.angle || a.row - b.row);
  const gap = rows > 1 ? (1 - inner) / (rows - 1) : 0.4;
  const along = Math.min(...counts.map((count, row) => (count > 1 ? (Math.PI * radii[row]) / (count - 1) : 1)));
  return { dots: placed.map(({ x, y }) => ({ x, y })), r: Math.min(gap, along) * 0.42 };
}

/** Breaks text into lines no wider than `width`, as measured by `measure`. */
export function wrap(text: string, width: number, measure: (s: string) => number, maxLines = 99): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > width) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  let last = kept[maxLines - 1];
  while (last.length > 1 && measure(`${last}…`) > width) last = last.slice(0, -1).trimEnd();
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}

/** Draws the card. Resolves once it is complete, including any portrait. */
export async function drawCard(canvas: HTMLCanvasElement, data: CardData): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas');
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.fillText(s, x, y);
  };
  const measureWith = (font: string) => (s: string) => { g.font = font; return g.measureText(s).width; };

  g.fillStyle = PAPER;
  g.fillRect(0, 0, CARD_W, CARD_H);
  g.fillStyle = data.accent;
  g.fillRect(0, 0, 18, CARD_H);

  // Bunting along the top, as on any street in campaign season.
  const flags = data.flags.length ? data.flags : [BRAND];
  for (let i = 0, x = 18; x < CARD_W; i++, x += 46) {
    g.fillStyle = flags[i % flags.length];
    g.globalAlpha = 0.9;
    g.beginPath(); g.moveTo(x + 4, 0); g.lineTo(x + 42, 0); g.lineTo(x + 23, 34); g.closePath(); g.fill();
  }
  g.globalAlpha = 1;

  // The masthead.
  g.fillStyle = BRAND;
  g.beginPath(); g.roundRect(60, 70, 84, 56, 10); g.fill();
  text('222', 102, 110, `800 30px ${FONT}`, '#ffffff', 'center');
  text('Kempen 222', 162, 108, `700 30px ${FONT}`, INK);

  const left = 60, colWidth = data.chamber || data.portrait || data.bars ? 560 : 1040;
  text(data.kicker.toUpperCase(), left, 196, `600 20px ${FONT}`, MUTED);
  const headFont = `800 ${data.headline.length > 22 ? 58 : 72}px ${FONT}`;
  const headLines = wrap(data.headline, colWidth, measureWith(headFont), 2);
  let y = 270;
  for (const line of headLines) { text(line, left, y, headFont, INK); y += data.headline.length > 22 ? 64 : 78; }
  if (data.body) {
    const bodyFont = `400 25px ${FONT}`;
    y -= 30;
    for (const line of wrap(data.body, colWidth, measureWith(bodyFont), 3)) { text(line, left, y, bodyFont, '#3a4352'); y += 34; }
  }

  // Figures along the bottom.
  const valueFont = `800 42px ${FONT}`, labelFont = `600 14px ${FONT}`;
  let x = left;
  data.stats.slice(0, 4).forEach((s, i) => {
    text(s.value, x, 520, valueFont, i === 0 ? data.accent : INK);
    text(s.label.toUpperCase(), x, 548, labelFont, MUTED);
    // Each figure takes the room it needs, so a long one never runs into its neighbour.
    x += Math.max(measureWith(valueFont)(s.value), measureWith(labelFont)(s.label.toUpperCase())) + 40;
  });

  const cx = 900;
  if (data.chamber) {
    const { dots, r } = hemicycle(data.chamber.seats.length);
    const R = 250, cy = 440;
    dots.forEach((d, i) => {
      g.fillStyle = data.chamber!.seats[i];
      g.beginPath(); g.arc(cx + d.x * R, cy - d.y * R, Math.max(2.5, r * R), 0, Math.PI * 2); g.fill();
    });
    text(data.chamber.caption, cx, cy + 56, `700 26px ${FONT}`, INK, 'center');
  } else if (data.bars) {
    const top = 200, width = 420, x0 = cx - width / 2;
    data.bars.slice(0, 5).forEach((b, i) => {
      const by = top + i * 62;
      text(b.label, x0, by, `600 20px ${FONT}`, INK);
      text(`${(b.share * 100).toFixed(1)}%`, x0 + width, by, `700 20px ${FONT}`, INK, 'right');
      g.fillStyle = '#e4ddcf';
      g.beginPath(); g.roundRect(x0, by + 10, width, 18, 9); g.fill();
      g.fillStyle = b.color;
      g.beginPath(); g.roundRect(x0, by + 10, Math.max(18, width * b.share), 18, 9); g.fill();
    });
  } else if (data.portrait) {
    try {
      const img = await loadImage(data.portrait.src);
      g.drawImage(img, cx - 140, 150, 280, 280);
      g.strokeStyle = data.accent; g.lineWidth = 6;
      g.beginPath(); g.arc(cx, 290, 143, 0, Math.PI * 2); g.stroke();
    } catch { /* the card stands without the picture */ }
    const capFont = `700 24px ${FONT}`;
    text(wrap(data.portrait.caption, 480, measureWith(capFont), 1)[0] ?? '', cx, 478, capFont, INK, 'center');
    text(data.portrait.sub, cx, 508, `600 20px ${FONT}`, MUTED, 'center');
  }

  g.fillStyle = '#ddd5c5';
  g.fillRect(60, 574, CARD_W - 120, 2);
  text(data.tagline, 60, 604, `600 16px ${FONT}`, MUTED);
  text(data.fiction, CARD_W - 60, 604, `400 16px ${FONT}`, MUTED, 'right');
}
