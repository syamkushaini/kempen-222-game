/**
 * The result card: one poster that sums up an election night or a career,
 * drawn on a canvas so it can be saved or shared. Everything on it comes from
 * `CardData`; nothing here knows about the game.
 */
export interface CardData {
  /** The player's party colour: the whole card is built from it. */
  accent: string;
  /** Small line above the headline: the contest. */
  kicker: string;
  /** The shout. Drawn in capitals. */
  headline: string;
  /** One line (two where there is room) under the headline, in the game's voice. */
  body?: string;
  /** The giant figure: seats, or the share of the vote, or a legacy score. */
  hero: { value: string; label: string; sub?: string };
  /** Up to four figures along the bottom. */
  stats: { label: string; value: string }[];
  /** Short marks of how it was done: difficulty, hidden odds, a challenge met. */
  badges?: string[];
  /** The chamber behind the hero: one colour per seat from left to right, the first `mine` of them the player's, which are lit. */
  chamber?: { seats: string[]; mine: number };
  /** Shares of the vote, for a contest with one seat. The first is the player's. */
  bars?: { label: string; share: number; color: string; mine?: boolean }[];
  /** The leader, as an image address, with a name under it and the party under that. */
  portrait?: { src: string; caption: string; sub: string };
  /** A picture to lay behind everything, washed into the party's colour: the 3D map as it stood at the end. */
  backdrop?: string;
  tagline: string;
  fiction: string;
}

export const CARD_W = 1200, CARD_H = 630;
const BRAND = '#5e6ad2';
const FONT = '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

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

// ---------- colour ----------

const parseHex = (c: string): [number, number, number] | null => {
  const m = /^#([0-9a-f]{6})$/i.exec(c.trim());
  return m ? [0, 2, 4].map((o) => parseInt(m[1].slice(o, o + 2), 16)) as [number, number, number] : null;
};
const toHex = (rgb: number[]) => `#${rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')}`;
/** `c` moved a share `t` of the way towards `to`. A colour that is not a hex code is returned as it is. */
export function mix(c: string, to: string, t: number): string {
  const a = parseHex(c), b = parseHex(to);
  return a && b ? toHex(a.map((v, i) => v + (b[i] - v) * t)) : c;
}
/** How bright a colour looks, from 0 (black) to 1 (white). */
export function luminance(c: string): number {
  const rgb = parseHex(c);
  if (!rgb) return 0.2;
  const [r, g, b] = rgb.map((v) => { const x = v / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const toHsl = ([r, g, b]: number[]): [number, number, number] => {
  const x = [r, g, b].map((v) => v / 255), max = Math.max(...x), min = Math.min(...x), l = (max + min) / 2, d = max - min;
  if (d === 0) return [0, 0, l];
  const sat = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === x[0] ? ((x[1] - x[2]) / d + (x[1] < x[2] ? 6 : 0)) : max === x[1] ? (x[2] - x[0]) / d + 2 : (x[0] - x[1]) / d + 4;
  return [h * 60, sat, l];
};
const fromHsl = (h: number, sat: number, l: number): string => {
  const c = (1 - Math.abs(2 * l - 1)) * sat, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
};

/**
 * The two colours of the poster's ground: the party's own hue, kept rich and darkened until white type stands out from
 * it (a gold party gets a deep amber, not a muddy olive), and a deeper one for the corners. A grey party stays grey.
 */
export function ground(accent: string): [string, string] {
  const rgb = parseHex(accent);
  if (!rgb) return [accent, accent];
  const [h, s0, l0] = toHsl(rgb);
  const sat = s0 === 0 ? 0 : Math.min(0.9, Math.max(s0, 0.6));
  let l = Math.min(l0, 0.52);
  while (l > 0.1 && luminance(fromHsl(h, sat, l)) > 0.16) l -= 0.01;
  return [fromHsl(h, sat, l), fromHsl(h, sat, Math.max(0.05, l * 0.5))];
}

/** The chamber as the poster draws it: the seats' ring pushed out from the centre, to leave a hole for the hero figure. */
const HOLE = 0.62;
export function posterChamber(n: number): { dots: Dot[]; r: number } {
  const { dots, r } = hemicycle(n);
  return {
    dots: dots.map(({ x, y }) => {
      const rho = Math.hypot(x, y) || 1;
      const out = HOLE + (rho - 0.4) * ((1 - HOLE) / 0.6);
      return { x: (x / rho) * out, y: (y / rho) * out };
    }),
    r: r * 0.7,
  };
}

/** The headline's size: the largest, down to 40, at which it fits `width` on one line, or else two lines at 40. */
export function fitHeadline(text: string, width: number, measure: (s: string, size: number) => number): { size: number; lines: string[] } {
  for (let size = 68; size >= 40; size -= 2) if (measure(text, size) <= width) return { size, lines: [text] };
  return { size: 40, lines: wrap(text, width, (s) => measure(s, 40), 2) };
}

/** Draws the card. Resolves once it is complete, including any portrait. */
export async function drawCard(canvas: HTMLCanvasElement, data: CardData): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas');
  // The card is set in the game's typeface, so it must be loaded before the canvas draws with it.
  try { await Promise.all([400, 500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 20px "Inter Variable"`))); } catch { /* the system face stands in */ }
  const WHITE = '#ffffff';
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.fillText(s, x, y);
  };
  const measureWith = (font: string) => (s: string) => { g.font = font; return g.measureText(s).width; };
  const pill = (s: string, x: number, y: number, font: string): number => {
    const w = measureWith(font)(s) + 24;
    g.fillStyle = 'rgba(0,0,0,0.32)'; g.beginPath(); g.roundRect(x, y, w, 28, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(x, y, w, 28, 14); g.stroke();
    text(s, x + 12, y + 19, font, WHITE);
    return w;
  };

  // The ground: the party's own colour, lit from the top left and dark in the corners.
  const [light, deep] = ground(data.accent);
  const wash = g.createLinearGradient(0, 0, CARD_W, CARD_H);
  wash.addColorStop(0, mix(light, '#ffffff', 0.1)); wash.addColorStop(0.55, light); wash.addColorStop(1, deep);
  g.fillStyle = wash; g.fillRect(0, 0, CARD_W, CARD_H);

  // Behind everything, where there is one: the map as it stood, faint, so that the card is a picture of this result and no other.
  if (data.backdrop) {
    try {
      const img = await loadImage(data.backdrop);
      const scale = Math.max(CARD_W / img.width, CARD_H / img.height);
      const w = img.width * scale, h = img.height * scale;
      g.save();
      g.globalAlpha = 0.55;
      g.globalCompositeOperation = 'luminosity';
      g.drawImage(img, (CARD_W - w) / 2, (CARD_H - h) / 2, w, h);
      g.restore();
    } catch { /* the card is whole without it */ }
  }

  // Rays out of the middle of the stage, as on any rally poster.
  const sx = 800, sy = data.chamber ? 506 : 360;
  g.save();
  g.beginPath(); g.rect(0, 0, CARD_W, CARD_H); g.clip();
  for (let i = 0, n = 26; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, a1 = a0 + (Math.PI * 2) / n / 2;
    g.fillStyle = 'rgba(255,255,255,0.055)';
    g.beginPath(); g.moveTo(sx, sy); g.lineTo(sx + Math.cos(a0) * 1400, sy + Math.sin(a0) * 1400); g.lineTo(sx + Math.cos(a1) * 1400, sy + Math.sin(a1) * 1400); g.closePath(); g.fill();
  }
  const glow = g.createRadialGradient(sx, sy, 20, sx, sy, 520);
  glow.addColorStop(0, 'rgba(255,255,255,0.22)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = glow; g.fillRect(0, 0, CARD_W, CARD_H);
  g.restore();
  g.strokeStyle = 'rgba(255,255,255,0.28)'; g.lineWidth = 2; g.beginPath(); g.roundRect(14, 14, CARD_W - 28, CARD_H - 28, 22); g.stroke();

  // The mark: small, in the corner.
  g.fillStyle = BRAND; g.beginPath(); g.roundRect(44, 38, 44, 30, 7); g.fill();
  text('222', 66, 61, `800 17px ${FONT}`, WHITE, 'center');
  text('KEMPEN 222', 98, 61, `700 17px ${FONT}`, 'rgba(255,255,255,0.85)');

  // The shout.
  const stageLeft = 420, stageWidth = CARD_W - stageLeft - 56;
  text(data.kicker.toUpperCase(), stageLeft, 62, `600 17px ${FONT}`, 'rgba(255,255,255,0.78)');
  const shout = data.headline.toUpperCase();
  const fit = fitHeadline(shout, stageWidth, (s, size) => measureWith(`900 ${size}px ${FONT}`)(s));
  g.save(); g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
  let y = fit.lines.length === 1 ? 132 : 108;
  let base = y;
  for (const line of fit.lines) { base = y; text(line, stageLeft, y, `900 ${fit.size}px ${FONT}`, WHITE); y += fit.size + 2; }
  g.restore();
  // The line under the shout sits just below it. Over a chamber there is room for one line only, and not for a two-line shout.
  if (data.body && !(data.chamber && fit.lines.length > 1)) {
    // Over a chamber the line must stay on one row: it shrinks to fit before it is ever cut short.
    let size = 22;
    while (data.chamber && size > 17 && measureWith(`500 ${size}px ${FONT}`)(data.body) > stageWidth) size--;
    const font = `500 ${size}px ${FONT}`;
    y = base + 34;
    for (const line of wrap(data.body, stageWidth, measureWith(font), data.chamber ? 1 : 2)) { text(line, stageLeft, y, font, 'rgba(255,255,255,0.92)'); y += 30; }
  }

  // The stage: the chamber with the hero figure in its hole, or the vote bars under the figure.
  const hero = data.hero;
  const heroFont = (size: number) => `900 ${size}px ${FONT}`;
  const fitNumber = (s: string, size: number, width: number) => { while (size > 60 && measureWith(heroFont(size))(s) > width) size -= 4; return size; };
  g.save(); g.shadowColor = 'rgba(0,0,0,0.4)'; g.shadowBlur = 20; g.shadowOffsetY = 6;
  if (data.chamber) {
    const { dots, r } = posterChamber(data.chamber.seats.length);
    const R = 322, cy = 506;
    dots.forEach((d, i) => {
      const lit = i < data.chamber!.mine;
      g.fillStyle = lit ? WHITE : 'rgba(0,0,0,0.30)';
      g.shadowBlur = lit ? 10 : 0; g.shadowColor = 'rgba(255,255,255,0.8)';
      g.beginPath(); g.arc(sx + d.x * R, cy - d.y * R, Math.max(2.5, r * R), 0, Math.PI * 2); g.fill();
    });
    g.shadowBlur = 20; g.shadowColor = 'rgba(0,0,0,0.4)';
    const size = fitNumber(hero.value, 150, HOLE * R * 2 * 0.86);
    text(hero.value, sx, cy - 52, heroFont(size), WHITE, 'center');
  } else {
    const size = fitNumber(hero.value, data.bars ? 150 : 190, 640);
    text(hero.value, sx, data.bars ? 316 : 392, heroFont(size), WHITE, 'center');
  }
  g.restore();
  // Under the figure: what it counts, and what it is out of. In the chamber's hole there is room for the two lines just above its floor.
  const labelY = data.chamber ? 506 - 22 : data.bars ? 352 : 436;
  text(hero.label.toUpperCase(), sx, labelY, `800 22px ${FONT}`, WHITE, 'center');
  if (hero.sub) text(hero.sub, sx, labelY + (data.chamber ? 24 : 30), `500 17px ${FONT}`, 'rgba(255,255,255,0.8)', 'center');

  if (data.bars) {
    const x0 = 500, width = 600, top = 392;
    data.bars.slice(0, 4).forEach((b, i) => {
      const by = top + i * 36;
      const font = `${b.mine ? 800 : 600} 18px ${FONT}`;
      text(b.label, x0, by, font, b.mine ? WHITE : 'rgba(255,255,255,0.75)');
      text(`${(b.share * 100).toFixed(1)}%`, x0 + width, by, font, b.mine ? WHITE : 'rgba(255,255,255,0.75)', 'right');
      g.fillStyle = 'rgba(0,0,0,0.28)'; g.beginPath(); g.roundRect(x0, by + 7, width, 11, 5.5); g.fill();
      g.fillStyle = b.mine ? WHITE : 'rgba(255,255,255,0.45)'; g.beginPath(); g.roundRect(x0, by + 7, Math.max(11, width * b.share), 11, 5.5); g.fill();
    });
  }

  // The leader.
  if (data.portrait) {
    const px = 60, py = 92, size = 300;
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.roundRect(px + 14, py + 14, size, size, 30); g.fill();
    try {
      const img = await loadImage(data.portrait.src);
      g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 28; g.shadowOffsetY = 10;
      g.fillStyle = deep; g.beginPath(); g.roundRect(px, py, size, size, 30); g.fill();
      g.restore();
      g.save(); g.beginPath(); g.roundRect(px, py, size, size, 30); g.clip();
      g.imageSmoothingQuality = 'high';
      g.drawImage(img, px, py, size, size);
      g.restore();
    } catch { g.fillStyle = deep; g.beginPath(); g.roundRect(px, py, size, size, 30); g.fill(); }
    g.strokeStyle = WHITE; g.lineWidth = 6; g.beginPath(); g.roundRect(px, py, size, size, 30); g.stroke();
    // The name plate overlaps the picture's lower edge.
    const nameFont = `800 20px ${FONT}`;
    const names = wrap(data.portrait.caption, size - 16, measureWith(nameFont), 2);
    const top = py + size - 30, height = 22 + names.length * 24 + 26;
    g.fillStyle = 'rgba(0,0,0,0.64)'; g.beginPath(); g.roundRect(px - 8, top, size + 16, height, 14); g.fill();
    names.forEach((line, i) => text(line, px + size / 2, top + 44 + i * 24, nameFont, WHITE, 'center'));
    text(wrap(data.portrait.sub, size - 16, measureWith(`600 15px ${FONT}`), 1)[0] ?? '', px + size / 2, top + 44 + names.length * 24 - 2, `600 15px ${FONT}`, 'rgba(255,255,255,0.8)', 'center');
  }

  // How it was done.
  if (data.badges?.length) {
    const font = `800 13px ${FONT}`;
    let bx = 60, by = 478;
    for (const b of data.badges.slice(0, 4)) {
      const label = b.toUpperCase();
      const w = measureWith(font)(label) + 24;
      if (bx + w > 372) { bx = 60; by += 32; }
      bx += pill(label, bx, by, font) + 8;
    }
  }

  // The figures.
  const stats = data.stats.slice(0, 4);
  const gap = 14, tileW = (CARD_W - 120 - gap * (stats.length - 1)) / Math.max(1, stats.length), tileTop = 540;
  stats.forEach((st, i) => {
    const tx = 60 + i * (tileW + gap);
    g.fillStyle = 'rgba(0,0,0,0.30)'; g.beginPath(); g.roundRect(tx, tileTop, tileW, 56, 14); g.fill();
    const label = st.label.toUpperCase();
    const vf = `900 28px ${FONT}`, lf = `700 12px ${FONT}`;
    text(st.value, tx + 18, tileTop + 31, vf, WHITE);
    text(wrap(label, tileW - 36, measureWith(lf), 1)[0] ?? '', tx + 18, tileTop + 47, lf, 'rgba(255,255,255,0.7)');
  });

  text(data.tagline, 60, 616, `500 12px ${FONT}`, 'rgba(255,255,255,0.6)');
  text(data.fiction, CARD_W - 60, 616, `500 12px ${FONT}`, 'rgba(255,255,255,0.6)', 'right');
}
