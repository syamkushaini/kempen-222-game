import { logoSvg } from './mark';
import { ground, loadImage, mix, wrap } from './shareCard';
/**
 * Pictures a player can show off that are not result posters: an organisation chart of the cabinet, an infographic of the
 * economy and the front page of a newspaper for the record. Each is drawn on a canvas from plain data; nothing here knows
 * about the game.
 */
const FONT = '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'Georgia, "Times New Roman", "Noto Serif", serif';
const INK = '#1b1f2a', MUTED = '#5b6475', LINE = '#d5d9e2', GOOD = '#16a34a', WARN = '#d97706';

export interface Footer { tagline: string; fiction: string }

/** The canvas and a few things every picture needs: text, measuring, a pill and the game's mark. */
async function kit(canvas: HTMLCanvasElement, width: number, height: number) {
  canvas.width = width;
  canvas.height = height;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas');
  try { await Promise.all([400, 500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 20px "Inter Variable"`))); } catch { /* the system face stands in */ }
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic';
    g.fillText(s, x, y);
  };
  const measure = (font: string) => (s: string) => { g.font = font; return g.measureText(s).width; };
  const box = (x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string) => {
    g.beginPath(); g.roundRect(x, y, w, h, r);
    g.fillStyle = fill; g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1.5; g.stroke(); }
  };
  const mark = async (x: number, y: number, size: number) => {
    try { g.drawImage(await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg())}`), x, y, size, size); } catch { /* the name beside it is enough */ }
  };
  /** A round picture, or a plain disc where there is none. */
  const face = async (src: string | undefined, cx: number, cy: number, r: number, ring: string) => {
    g.save(); g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.clip();
    g.fillStyle = mix(ring, '#ffffff', 0.7); g.fillRect(cx - r, cy - r, r * 2, r * 2);
    if (src) { try { g.drawImage(await loadImage(src), cx - r, cy - r, r * 2, r * 2); } catch { /* the disc stands */ } }
    g.restore();
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.strokeStyle = ring; g.lineWidth = 3; g.stroke();
  };
  /** One line no wider than `width`: cut with an ellipsis where it is too long, even if it is a single word. */
  const fit = (s: string, width: number, font: string) => {
    const m = measure(font);
    if (m(s) <= width) return s;
    let out = s;
    while (out.length > 1 && m(`${out}…`) > width) out = out.slice(0, -1).trimEnd();
    return `${out}…`;
  };
  return { g, text, measure, box, mark, face, fit };
}

// ---------- the cabinet as an organisation chart ----------

export interface Person { post: string; name: string; stars: number; color: string; portrait?: string; mine?: boolean }
export interface CabinetChart extends Footer {
  accent: string;
  title: string;
  kicker: string;
  /** The head of government, at the top of the chart. */
  head: Person & { sub: string };
  /** The branches under the head, each with a title and the people in it. */
  branches: { title: string; people: Person[] }[];
  facts: { label: string; value: string }[];
}

const TILE_H = 62, TILE_GAP = 8;

export async function drawCabinetChart(canvas: HTMLCanvasElement, d: CabinetChart): Promise<void> {
  const cols = Math.max(1, d.branches.length);
  const tallest = Math.max(1, ...d.branches.map((b) => b.people.length));
  const W = Math.max(1200, 330 * cols + 60), top = 420;
  const H = top + tallest * (TILE_H + TILE_GAP) + 150;
  const { g, text, measure, box, mark, face, fit } = await kit(canvas, W, H);
  const [light, deep] = ground(d.accent);

  g.fillStyle = '#f4f6fb'; g.fillRect(0, 0, W, H);
  const band = g.createLinearGradient(0, 0, W, 0);
  band.addColorStop(0, light); band.addColorStop(1, deep);
  g.fillStyle = band; g.fillRect(0, 0, W, 96);
  await mark(36, 26, 44);
  text('KEMPEN 222', 92, 58, `700 17px ${FONT}`, 'rgba(255,255,255,0.85)');
  text(d.title.toUpperCase(), W - 40, 48, `900 30px ${FONT}`, '#ffffff', 'right');
  text(d.kicker, W - 40, 74, `600 15px ${FONT}`, 'rgba(255,255,255,0.8)', 'right');

  // The head: the one box at the top.
  const hw = 420, hh = 130, hx = (W - hw) / 2, hy = 126;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.18)'; g.shadowBlur = 20; g.shadowOffsetY = 6;
  box(hx, hy, hw, hh, 22, '#ffffff', d.head.color);
  g.restore();
  g.fillStyle = d.head.color; g.beginPath(); g.roundRect(hx, hy, 12, hh, [22, 0, 0, 22]); g.fill();
  await face(d.head.portrait, hx + 78, hy + hh / 2, 46, d.head.color);
  const nf = `900 24px ${FONT}`;
  wrap(d.head.name, hw - 150, measure(nf), 2).forEach((line, i, all) => text(line, hx + 142, hy + (all.length > 1 ? 52 : 66) + i * 28, nf, INK));
  text(fit(d.head.post.toUpperCase(), hw - 160, `800 13px ${FONT}`), hx + 142, hy + 94, `800 13px ${FONT}`, d.head.color === '#ffffff' ? MUTED : mix(d.head.color, '#000000', 0.25));
  text(fit(d.head.sub, hw - 160, `500 14px ${FONT}`), hx + 142, hy + 114, `500 14px ${FONT}`, MUTED);

  // The branches: a bar under the head, a drop to each, and the people in a line down the side.
  const margin = 30, colW = (W - margin * 2) / cols, bus = 300;
  g.strokeStyle = '#94a0b8'; g.lineWidth = 3; g.lineCap = 'round';
  const centre = (i: number) => margin + colW * i + colW / 2;
  g.beginPath(); g.moveTo(W / 2, hy + hh); g.lineTo(W / 2, bus);
  if (cols > 1) { g.moveTo(centre(0), bus); g.lineTo(centre(cols - 1), bus); }
  d.branches.forEach((_, i) => { g.moveTo(centre(i), bus); g.lineTo(centre(i), bus + 28); });
  g.stroke();

  for (let i = 0; i < cols; i++) {
    const b = d.branches[i];
    const bx = margin + colW * i + 10, bw = colW - 20, by = bus + 28;
    box(bx, by, bw, 52, 14, mix(d.accent, '#000000', 0.15));
    text(fit(b.title.toUpperCase(), bw - 24, `800 16px ${FONT}`), bx + bw / 2, by + 32, `800 16px ${FONT}`, '#ffffff', 'center');
    const spine = bx + 14, last = by + 52 + 14 + (b.people.length - 1) * (TILE_H + TILE_GAP) + TILE_H / 2;
    g.strokeStyle = '#b8c1d4'; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(spine, by + 52); g.lineTo(spine, last); g.stroke();
    for (let j = 0; j < b.people.length; j++) {
      const p = b.people[j], ty = by + 52 + 14 + j * (TILE_H + TILE_GAP), tx = spine + 16, tw = bw - 30;
      g.strokeStyle = '#b8c1d4'; g.beginPath(); g.moveTo(spine, ty + TILE_H / 2); g.lineTo(tx, ty + TILE_H / 2); g.stroke();
      box(tx, ty, tw, TILE_H, 12, p.mine ? mix(d.accent, '#ffffff', 0.86) : '#ffffff', p.mine ? d.accent : LINE);
      g.fillStyle = p.color; g.beginPath(); g.roundRect(tx, ty, 7, TILE_H, [12, 0, 0, 12]); g.fill();
      await face(p.portrait, tx + 40, ty + TILE_H / 2, 22, p.color);
      const f1 = `800 15px ${FONT}`, f2 = `700 11px ${FONT}`, f3 = `600 11px ${FONT}`;
      const stars = '★'.repeat(p.stars) + '☆'.repeat(Math.max(0, 5 - p.stars));
      const room = tw - 72 - 12, starsW = measure(f3)(stars);
      text(fit(p.name, room, f1), tx + 72, ty + 27, f1, INK);
      // The post gets what the stars leave; the stars keep their own corner.
      text(fit(p.post.toUpperCase(), room - starsW - 10, f2), tx + 72, ty + 47, f2, MUTED);
      text(stars, tx + tw - 12, ty + 47, f3, WARN, 'right');
    }
  }

  // The figures, in a row along the foot.
  const fy = H - 124, gap = 14, fw = (W - margin * 2 - gap * (d.facts.length - 1)) / Math.max(1, d.facts.length);
  d.facts.slice(0, 4).forEach((f, i) => {
    const fx = margin + i * (fw + gap);
    box(fx, fy, fw, 70, 16, '#ffffff', LINE);
    text(f.value, fx + 20, fy + 42, `900 30px ${FONT}`, mix(d.accent, '#000000', 0.2));
    text(fit(f.label.toUpperCase(), fw - 40, `700 11px ${FONT}`), fx + 20, fy + 60, `700 11px ${FONT}`, MUTED);
  });
  text(d.tagline, margin, H - 24, `500 12px ${FONT}`, MUTED);
  text(d.fiction, W - margin, H - 24, `500 12px ${FONT}`, MUTED, 'right');
}

// ---------- the economy as an infographic ----------

export interface EconomyInfographic extends Footer {
  accent: string;
  title: string;
  kicker: string;
  gdp: { value: string; label: string };
  chips: { label: string; value: string }[];
  trend: { title: string; points: { label: string; value: number }[] };
  sectors: { title: string; parts: { label: string; share: number; color: string }[] };
  gauges: { title: string; items: { label: string; value: string; frac: number; good: boolean }[] };
  note: string;
}

export async function drawEconomy(canvas: HTMLCanvasElement, d: EconomyInfographic): Promise<void> {
  const W = 1080, H = 1560;
  const { g, text, measure, box, mark } = await kit(canvas, W, H);
  const [light, deep] = ground(d.accent);
  const pad = 56, inner = W - pad * 2;

  g.fillStyle = '#f4f6fb'; g.fillRect(0, 0, W, H);
  const head = g.createLinearGradient(0, 0, W, 460);
  head.addColorStop(0, light); head.addColorStop(1, deep);
  g.fillStyle = head; g.fillRect(0, 0, W, 470);
  // Rings off the corner, for the look of a magazine page.
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2;
  for (let r = 120; r < 700; r += 70) { g.beginPath(); g.arc(W, 0, r, 0, Math.PI * 2); g.stroke(); }
  await mark(pad, 40, 48);
  text('KEMPEN 222', pad + 58, 72, `700 18px ${FONT}`, 'rgba(255,255,255,0.88)');
  text(d.kicker.toUpperCase(), W - pad, 70, `600 15px ${FONT}`, 'rgba(255,255,255,0.8)', 'right');
  const tf = `900 54px ${FONT}`;
  wrap(d.title.toUpperCase(), inner, measure(tf), 2).forEach((line, i) => text(line, pad, 170 + i * 60, tf, '#ffffff'));
  let size = 150;
  while (size > 70 && measure(`900 ${size}px ${FONT}`)(d.gdp.value) > inner) size -= 6;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.3)'; g.shadowBlur = 16; g.shadowOffsetY = 5;
  text(d.gdp.value, pad, 340, `900 ${size}px ${FONT}`, '#ffffff');
  g.restore();
  text(d.gdp.label.toUpperCase(), pad, 384, `800 20px ${FONT}`, 'rgba(255,255,255,0.88)');

  // Chips that straddle the edge of the header.
  const gap = 16, cw = (inner - gap * (d.chips.length - 1)) / Math.max(1, d.chips.length), cy = 424;
  d.chips.slice(0, 3).forEach((c, i) => {
    const cx = pad + i * (cw + gap);
    g.save(); g.shadowColor = 'rgba(0,0,0,0.16)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
    box(cx, cy, cw, 96, 20, '#ffffff');
    g.restore();
    text(c.value, cx + 22, cy + 48, `900 32px ${FONT}`, INK);
    text(c.label.toUpperCase(), cx + 22, cy + 74, `700 12px ${FONT}`, MUTED);
  });

  // The line of past years.
  const section = (title: string, y: number) => text(title.toUpperCase(), pad, y, `800 16px ${FONT}`, mix(d.accent, '#000000', 0.2));
  section(d.trend.title, 590);
  const cx0 = pad + 8, cw0 = inner - 16, cTop = 620, cH = 230;
  box(pad, cTop - 14, inner, cH + 70, 20, '#ffffff', LINE);
  const pts = d.trend.points;
  if (pts.length >= 2) {
    const lo = Math.min(...pts.map((p) => p.value)), hi = Math.max(...pts.map((p) => p.value)), span = hi - lo || 1;
    const at = (v: number, i: number): [number, number] => [cx0 + 30 + ((cw0 - 60) * i) / (pts.length - 1), cTop + cH - 24 - ((v - lo) / span) * (cH - 70)];
    g.strokeStyle = '#e8ebf2'; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) { const y = cTop + 10 + (i * (cH - 40)) / 3; g.beginPath(); g.moveTo(cx0 + 10, y); g.lineTo(cx0 + cw0 - 10, y); g.stroke(); }
    g.beginPath(); g.moveTo(at(pts[0].value, 0)[0], cTop + cH - 8);
    pts.forEach((p, i) => g.lineTo(...at(p.value, i)));
    g.lineTo(at(0, pts.length - 1)[0], cTop + cH - 8); g.closePath();
    const area = g.createLinearGradient(0, cTop, 0, cTop + cH);
    area.addColorStop(0, mix(d.accent, '#ffffff', 0.55)); area.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = area; g.fill();
    g.beginPath(); pts.forEach((p, i) => (i === 0 ? g.moveTo(...at(p.value, i)) : g.lineTo(...at(p.value, i))));
    g.strokeStyle = d.accent; g.lineWidth = 5; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
    pts.forEach((p, i) => {
      const [x, y] = at(p.value, i);
      g.beginPath(); g.arc(x, y, i === pts.length - 1 ? 9 : 5, 0, Math.PI * 2); g.fillStyle = i === pts.length - 1 ? d.accent : '#ffffff'; g.fill();
      g.strokeStyle = d.accent; g.lineWidth = 3; g.stroke();
      text(p.label, x, cTop + cH + 22, `600 13px ${FONT}`, MUTED, 'center');
    });
  } else {
    text('—', W / 2, cTop + cH / 2, `700 30px ${FONT}`, LINE, 'center');
  }

  // Where the money comes from: one bar cut into four.
  section(d.sectors.title, 960);
  const by = 990, bh = 56;
  box(pad, by - 12, inner, bh + 100, 20, '#ffffff', LINE);
  let sx = pad + 20;
  const bw = inner - 40;
  g.save(); g.beginPath(); g.roundRect(sx, by, bw, bh, 14); g.clip();
  d.sectors.parts.forEach((p) => { g.fillStyle = p.color; g.fillRect(sx, by, bw * p.share + 1, bh); sx += bw * p.share; });
  g.restore();
  d.sectors.parts.forEach((p, i) => {
    const lx = pad + 20 + i * (bw / d.sectors.parts.length), ly = by + bh + 34;
    g.fillStyle = p.color; g.beginPath(); g.arc(lx + 8, ly - 6, 8, 0, Math.PI * 2); g.fill();
    text(`${Math.round(p.share * 100)}%`, lx + 26, ly, `900 20px ${FONT}`, INK);
    text(p.label, lx + 26, ly + 20, `600 13px ${FONT}`, MUTED);
  });

  // The report card: a ring for each of the figures a government is judged on.
  section(d.gauges.title, 1182);
  box(pad, 1204, inner, 236, 20, '#ffffff', LINE);
  const n = d.gauges.items.length, slot = inner / Math.max(1, n);
  d.gauges.items.forEach((it, i) => {
    const x = pad + slot * i + slot / 2, y = 1292, r = 52;
    const colour = it.good ? GOOD : WARN;
    g.lineWidth = 14; g.lineCap = 'round';
    g.strokeStyle = '#e8ebf2'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.strokeStyle = colour; g.beginPath(); g.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.04, Math.min(1, it.frac))); g.stroke();
    text(it.value, x, y + 9, `900 24px ${FONT}`, INK, 'center');
    text(it.label.toUpperCase(), x, y + r + 40, `800 13px ${FONT}`, MUTED, 'center');
    text(it.good ? '▲' : '▼', x, y + r + 62, `700 14px ${FONT}`, colour, 'center');
  });

  const nf = `500 18px ${FONT}`;
  wrap(d.note, inner, measure(nf), 2).forEach((line, i) => text(line, pad, 1486 + i * 26, nf, INK));
  text(d.tagline, pad, H - 22, `500 12px ${FONT}`, MUTED);
  text(d.fiction, W - pad, H - 22, `500 12px ${FONT}`, MUTED, 'right');
}

// ---------- the record as the front page of a newspaper ----------

export interface FrontPage extends Footer {
  accent: string;
  paper: string;
  dateline: string;
  headline: string;
  standfirst: string;
  byline: string;
  /** The article, a paragraph each, most important first: those that do not fit are left out from the end. */
  body: string[];
  quote: { text: string; by: string };
  portrait?: string;
  caption: string;
  chart?: { title: string; bars: { label: string; value: number; won: boolean }[] };
  numbers: { title: string; items: { label: string; value: string }[] };
}

/** `text` broken into lines, each as wide as `widthOf(its number)` allows. */
function shape(text: string, widthOf: (line: number) => number, measure: (s: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && measure(next) > widthOf(lines.length)) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function drawFrontPage(canvas: HTMLCanvasElement, d: FrontPage): Promise<void> {
  const W = 1200, H = 1176;
  const { g, text, measure, mark, fit } = await kit(canvas, W, H);
  const PAPER = '#f4efe3', RULE = '#2a2620', SOFT = '#4a4338', GRID = '#b9ae96', pad = 50, inner = W - pad * 2;
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  // A little grain, so the page does not look printed by a screen.
  for (let i = 0; i < 2200; i++) { g.fillStyle = `rgba(90,70,40,${Math.random() * 0.05})`; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
  const rule = (y: number, w = 1, x = pad, len = inner) => { g.fillStyle = RULE; g.fillRect(x, y, len, w); };

  // The masthead.
  rule(36, 4); rule(44, 1);
  await mark(pad, 56, 40);
  text(d.paper, W / 2, 104, `900 58px ${SERIF}`, RULE, 'center');
  rule(122, 1); rule(130, 4);
  text(fit(d.dateline.toUpperCase(), inner, `600 14px ${SERIF}`), W / 2, 156, `600 14px ${SERIF}`, SOFT, 'center');
  rule(168, 1);

  // The headline and the line under it, centred together in a zone of fixed height, so that the page below always starts at the same place.
  const hf = (size: number) => `900 ${size}px ${SERIF}`;
  const shout = d.headline.toUpperCase();
  // The biggest size at which it is one line, or two lines of at most 56; the words are never cut.
  let hs = 76;
  let hl = wrap(shout, inner, measure(hf(hs)), 99);
  while (hs > 40 && (hl.length > 2 || (hl.length === 2 && hs > 56))) { hs -= 4; hl = wrap(shout, inner, measure(hf(hs)), 99); }
  const sf = `italic 500 21px ${SERIF}`;
  const sl = wrap(d.standfirst, inner - 160, measure(sf), 2);
  const block = hl.length * (hs + 4) + 14 + sl.length * 28;
  let y = 180 + (210 - block) / 2 + hs;
  hl.forEach((l) => { text(l, W / 2, y, hf(hs), RULE, 'center'); y += hs + 4; });
  y += 2;
  sl.forEach((l) => { text(l, W / 2, y + 12, sf, '#3a342a', 'center'); y += 28; });
  const top = 426;
  rule(top - 10, 2);

  // Row one, all the same height: the photograph, the article in two columns, the box of numbers.
  const rowH = 440, photoW = 280, sideW = 250, gapX = 28;
  const textX = pad + photoW + gapX, textW = inner - photoW - sideW - gapX * 2, colGap = 24, colW = (textW - colGap) / 2;
  const sideX = textX + textW + gapX;

  // The photograph, cropped to fill its frame, with its caption under it.
  const photoH = 330;
  g.save(); g.beginPath(); g.rect(pad, top, photoW, photoH); g.clip();
  g.fillStyle = '#cfc7b4'; g.fillRect(pad, top, photoW, photoH);
  if (d.portrait) {
    try {
      const img = await loadImage(d.portrait);
      const k = Math.max(photoW / img.width, photoH / img.height);
      g.filter = 'grayscale(1) contrast(1.1)';
      g.drawImage(img, pad + (photoW - img.width * k) / 2, top + (photoH - img.height * k) / 2, img.width * k, img.height * k);
      g.filter = 'none';
    } catch { g.filter = 'none'; }
  }
  g.globalAlpha = 0.16; g.fillStyle = d.accent; g.fillRect(pad, top, photoW, photoH); g.globalAlpha = 1;
  g.restore();
  g.strokeStyle = RULE; g.lineWidth = 2; g.strokeRect(pad, top, photoW, photoH);
  const cf = `italic 500 15px ${SERIF}`;
  wrap(d.caption, photoW, measure(cf), 4).forEach((l, i) => text(l, pad, top + photoH + 26 + i * 21, cf, RULE));

  // The article: a byline, then paragraphs in two justified columns, the first with a drop cap.
  text(fit(d.byline.toUpperCase(), textW, `800 12px ${SERIF}`), textX, top + 12, `800 12px ${SERIF}`, SOFT);
  rule(top + 22, 1, textX, textW);
  const bodyFont = `500 15px ${SERIF}`, lineH = 22, bodyTop = top + 46, perCol = Math.floor((rowH - 46) / lineH);
  const m = measure(bodyFont);
  const capFont = `900 64px ${SERIF}`, first = d.body[0] ?? '';
  const cap = first.charAt(0).toUpperCase(), capW = (cap ? measure(capFont)(cap) : 0) + 8;
  type Row = { t: string; x: number; w: number; last: boolean };
  const rows: Row[] = [];
  for (let n = 0; n < d.body.length; n++) {
    const para = n === 0 ? first.slice(1).trimStart() : d.body[n];
    const lead = n === 0 ? capW : 14;
    const lines = shape(para, (i) => colW - (n === 0 ? (i < 3 ? capW : 0) : i === 0 ? 14 : 0), m);
    if (rows.length + lines.length > perCol * 2) break;
    lines.forEach((t, i) => rows.push({ t, x: n === 0 ? (i < 3 ? lead : 0) : i === 0 ? lead : 0, w: colW - (n === 0 ? (i < 3 ? capW : 0) : i === 0 ? 14 : 0), last: i === lines.length - 1 }));
  }
  rows.forEach((r, i) => {
    const col = Math.floor(i / perCol), x = textX + col * (colW + colGap) + r.x, ly = bodyTop + (i % perCol) * lineH + 14;
    const words = r.t.split(' ');
    // Justified, except the last line of a paragraph and any line that would be pulled apart.
    const natural = m(r.t), extra = r.w - natural;
    if (r.last || words.length < 2 || extra > r.w * 0.2) { text(r.t, x, ly, bodyFont, RULE); return; }
    const space = extra / (words.length - 1) + m(' ');
    let wx = x;
    words.forEach((w) => { text(w, wx, ly, bodyFont, RULE); wx += m(w) + space; });
  });
  if (cap) text(cap, textX, bodyTop + 14 + 2 * lineH + 4, capFont, d.accent === '#ffffff' ? RULE : mix(d.accent, '#000000', 0.2));
  g.fillStyle = GRID; g.fillRect(textX + colW + colGap / 2, bodyTop - 4, 1, rowH - 46);

  // The box of numbers, as tall as the row.
  g.fillStyle = RULE; g.fillRect(sideX, top, sideW, 40);
  text(fit(d.numbers.title.toUpperCase(), sideW - 20, `800 15px ${SERIF}`), sideX + sideW / 2, top + 26, `800 15px ${SERIF}`, PAPER, 'center');
  g.strokeStyle = RULE; g.lineWidth = 2; g.strokeRect(sideX, top, sideW, rowH);
  const items = d.numbers.items.slice(0, 4), each = (rowH - 40) / Math.max(1, items.length);
  items.forEach((it, i) => {
    const ry = top + 40 + i * each;
    if (i > 0) { g.fillStyle = GRID; g.fillRect(sideX + 16, ry, sideW - 32, 1); }
    text(it.value, sideX + sideW / 2, ry + each / 2 + 10, `900 46px ${SERIF}`, RULE, 'center');
    const lf = `700 11px ${SERIF}`;
    wrap(it.label.toUpperCase(), sideW - 28, measure(lf), 2).forEach((l, j) => text(l, sideX + sideW / 2, ry + each / 2 + 32 + j * 14, lf, SOFT, 'center'));
  });

  // Row two: the chart of the elections, and a pull quote.
  const r2 = top + rowH + 34, r2H = 200;
  rule(r2 - 14, 2);
  const chartW = d.chart && d.chart.bars.length ? 600 : 0;
  if (chartW) {
    text(d.chart!.title.toUpperCase(), pad, r2 + 14, `800 14px ${SERIF}`, RULE);
    g.fillStyle = RULE; g.fillRect(pad, r2 + 24, chartW, 2);
    const ctop = r2 + 54, base = r2 + r2H - 26, hi = Math.max(1, ...d.chart!.bars.map((b) => b.value));
    const bars = d.chart!.bars, slot = chartW / bars.length, bw = Math.min(54, slot * 0.6);
    g.strokeStyle = GRID; g.lineWidth = 1;
    for (let i = 0; i <= 2; i++) { const gy = base - ((base - ctop) * i) / 2; g.beginPath(); g.moveTo(pad, gy); g.lineTo(pad + chartW, gy); g.stroke(); }
    bars.forEach((b, i) => {
      const bx = pad + slot * i + (slot - bw) / 2, bh = Math.max(3, ((base - ctop) * b.value) / hi);
      g.fillStyle = b.won ? d.accent : '#9b9484'; g.fillRect(bx, base - bh, bw, bh);
      text(String(b.value), bx + bw / 2, base - bh - 7, `800 15px ${SERIF}`, RULE, 'center');
      text(b.label, bx + bw / 2, base + 18, `600 12px ${SERIF}`, SOFT, 'center');
    });
  }
  const qx = chartW ? pad + chartW + 50 : pad + 100, qw = chartW ? inner - chartW - 50 : inner - 200;
  g.fillStyle = RULE; g.fillRect(qx, r2, qw, 2); g.fillRect(qx, r2 + r2H - 4, qw, 2);
  text('“', qx, r2 + 74, `900 90px ${SERIF}`, d.accent === '#ffffff' ? RULE : mix(d.accent, '#000000', 0.15));
  const qf = `italic 700 24px ${SERIF}`;
  const ql = wrap(d.quote.text, qw - 56, measure(qf), 4);
  const qTop = r2 + 44 + Math.max(0, (r2H - 44 - 50 - ql.length * 32) / 2);
  ql.forEach((l, i) => text(l, qx + 52, qTop + i * 32, qf, RULE));
  text(fit(`— ${d.quote.by}`, qw - 56, `600 14px ${SERIF}`), qx + qw, r2 + r2H - 18, `600 14px ${SERIF}`, SOFT, 'right');

  rule(H - 56, 2);
  text(d.tagline, pad, H - 28, `500 12px ${SERIF}`, SOFT);
  text(d.fiction, W - pad, H - 28, `500 12px ${SERIF}`, SOFT, 'right');
}
