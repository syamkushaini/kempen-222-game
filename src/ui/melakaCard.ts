import { logoSvg } from './mark';
import { CARD_H, CARD_W, fitHeadline, loadImage, mix, wrap, type CardData } from './shareCard';

/**
 * The result card of a Melaka state election: the same figures as the ordinary card, in a picture of the old town at dusk: the red clock
 * tower of the Stadthuys, the gate of A Famosa, the revolving tower, the river with its cruise boat and the crowd on the bank under strings
 * of lights. The 28 seats hang as lanterns, the player's own lit. Everything is drawn here, so the picture needs no file and is the same
 * every time.
 */

const FONT = '"Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const WHITE = '#ffffff';
/** Where the bank meets the water: the buildings stand on this line. */
const BANK = 470;

/** A number from 0 to 1 that depends only on the index, so that the picture never changes between draws. */
export const unit = (i: number): number => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

/** Where the lanterns of one string hang: spread from `x0` to `x1`, the string sagging by `sag` in the middle. */
export function lanternString(n: number, x0: number, x1: number, y: number, sag: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => {
    const u = n === 1 ? 0.5 : i / (n - 1);
    return { x: x0 + (x1 - x0) * u, y: y + sag * 4 * u * (1 - u) };
  });
}

/** The colours of the flags: the parties on the card, each once, the first (the player's) first. */
export const flagColours = (seats: string[], mine: string): string[] => [mine, ...seats.filter((c) => c !== mine)].filter((c, i, all) => all.indexOf(c) === i).slice(0, 5);

export async function drawMelakaCard(canvas: HTMLCanvasElement, data: CardData, pill: string): Promise<void> {
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas');
  try { await Promise.all([400, 500, 600, 700, 800, 900].map((w) => document.fonts.load(`${w} 20px "Inter Variable"`))); } catch { /* the system face stands in */ }
  const text = (s: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'left') => {
    g.font = font; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'alphabetic'; g.fillText(s, x, y);
  };
  const measureWith = (font: string) => (s: string) => { g.font = font; return g.measureText(s).width; };
  const mine = data.chamber?.seats[0] ?? data.accent;
  const flags = flagColours(data.chamber?.seats ?? [], mine);

  // ----- the sky -----
  const sky = g.createLinearGradient(0, 0, 0, BANK);
  sky.addColorStop(0, '#070b24'); sky.addColorStop(0.32, '#1c1a58'); sky.addColorStop(0.6, '#7b2f78'); sky.addColorStop(0.82, '#e0502c'); sky.addColorStop(1, '#ffab4a');
  g.fillStyle = sky; g.fillRect(0, 0, CARD_W, CARD_H);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${0.15 + unit(i + 400) * 0.5})`; g.fillRect(unit(i) * CARD_W, unit(i + 50) * 150, 1.6, 1.6); }
  // The sun, half down in the sea.
  const sunX = 1150, sunY = 452;
  const glow = g.createRadialGradient(sunX, sunY, 4, sunX, sunY, 330);
  glow.addColorStop(0, 'rgba(255,214,120,0.95)'); glow.addColorStop(0.18, 'rgba(255,150,60,0.55)'); glow.addColorStop(1, 'rgba(255,90,40,0)');
  g.fillStyle = glow; g.fillRect(0, 0, CARD_W, BANK);
  g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(sunX, sunY, 24, Math.PI, 0); g.fill();
  // Clouds, streaked along the sky.
  for (let i = 0; i < 16; i++) {
    const cy = 50 + unit(i + 90) * 320, cx = 380 + unit(i + 20) * 860, w = 110 + unit(i + 5) * 280, h = 7 + unit(i + 31) * 15;
    g.fillStyle = cy < 170 ? 'rgba(86,70,170,0.5)' : cy < 300 ? 'rgba(235,110,90,0.4)' : 'rgba(255,170,90,0.5)';
    g.beginPath(); g.ellipse(cx, cy, w, h, -0.02, 0, Math.PI * 2); g.fill();
  }
  // Far hills and the sea beyond the roofs, with the island and its cranes.
  g.fillStyle = '#3a2250';
  g.beginPath(); g.moveTo(560, BANK); g.lineTo(560, 430); g.quadraticCurveTo(700, 396, 830, 424); g.quadraticCurveTo(930, 404, 1010, 428); g.lineTo(1010, BANK); g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,170,90,0.55)'; g.fillRect(1010, 440, CARD_W - 1010, BANK - 440);
  g.fillStyle = '#2a1a44'; g.fillRect(1060, 438, 120, 6);
  g.strokeStyle = '#2a1a44'; g.lineWidth = 2;
  for (const [cx, h] of [[1080, 26], [1120, 34], [1160, 22]] as const) { g.beginPath(); g.moveTo(cx, 438); g.lineTo(cx, 438 - h); g.lineTo(cx + 18, 438 - h + 4); g.stroke(); }

  // ----- the town, behind the bank -----
  const lit = (x: number, y: number, w: number, h: number) => { g.fillStyle = '#ffd36a'; g.beginPath(); g.roundRect(x, y, w, h, w / 2 > 4 ? 4 : 1.5); g.fill(); };
  // The revolving tower: a pole, and the lit cabin round it.
  const tx = 1062;
  g.fillStyle = '#d9d2e6'; g.fillRect(tx - 4, 168, 8, BANK - 168);
  g.fillStyle = '#8f86b4'; g.fillRect(tx + 1, 168, 3, BANK - 168);
  g.fillStyle = '#2b2a5f'; g.beginPath(); g.ellipse(tx, 176, 30, 9, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#7ad7ff'; g.beginPath(); g.ellipse(tx, 174, 24, 4.5, 0, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#d9d2e6'; g.lineWidth = 3; g.beginPath(); g.moveTo(tx, 168); g.lineTo(tx, 122); g.stroke();
  g.fillStyle = '#ff4d4d'; g.beginPath(); g.arc(tx, 120, 3.2, 0, Math.PI * 2); g.fill();
  // The gate of A Famosa: pale stone, an arch and a pediment, lit from inside.
  g.fillStyle = '#c9b48c'; g.fillRect(618, 360, 104, BANK - 360);
  g.fillStyle = '#b39c74'; g.fillRect(706, 360, 16, BANK - 360);
  g.beginPath(); g.moveTo(612, 362); g.lineTo(670, 322); g.lineTo(728, 362); g.closePath(); g.fillStyle = '#d8c6a0'; g.fill();
  g.fillStyle = '#7a6444'; g.beginPath(); g.arc(670, 346, 8, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffb347'; g.beginPath(); g.moveTo(646, BANK); g.lineTo(646, 410); g.quadraticCurveTo(670, 380, 694, 410); g.lineTo(694, BANK); g.closePath(); g.fill();
  g.fillStyle = 'rgba(60,40,20,0.35)'; for (let i = 0; i < 14; i++) { g.beginPath(); g.arc(624 + unit(i + 700) * 92, 368 + unit(i + 710) * 90, 2 + unit(i + 720) * 3, 0, Math.PI * 2); g.fill(); }
  // The Stadthuys: red brick, a long hall with arched windows and a clock tower.
  g.fillStyle = '#b3402a'; g.fillRect(740, 398, 270, BANK - 398);
  g.fillStyle = '#5a1f22'; g.beginPath(); g.moveTo(732, 400); g.lineTo(760, 372); g.lineTo(990, 372); g.lineTo(1018, 400); g.closePath(); g.fill();
  for (let i = 0; i < 9; i++) lit(754 + i * 28, 414, 13, 28);
  g.fillStyle = '#cd4a30'; g.fillRect(740, 252, 62, 146);
  g.fillStyle = '#5a1f22'; g.beginPath(); g.moveTo(732, 254); g.lineTo(771, 214); g.lineTo(810, 254); g.closePath(); g.fill();
  g.fillStyle = '#fff1d0'; g.beginPath(); g.arc(771, 288, 17, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#3a1a1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(771, 288); g.lineTo(771, 276); g.moveTo(771, 288); g.lineTo(780, 292); g.stroke();
  lit(756, 322, 12, 30); lit(774, 322, 12, 30);
  g.fillStyle = '#bb4a2e'; g.beginPath(); g.roundRect(1010, 372, 78, BANK - 372, 2); g.fill();
  g.fillStyle = '#5a1f22'; g.beginPath(); g.arc(1049, 372, 24, Math.PI, 0); g.fill(); g.fillRect(1046, 330, 6, 20);
  lit(1024, 396, 11, 26); lit(1062, 396, 11, 26);
  // Trees in front: palms, and the dark masses of the old town's trees.
  const palm = (x: number, h: number, lean: number) => {
    const top = { x: x + lean, y: BANK - h };
    g.strokeStyle = '#120c20'; g.lineWidth = 5; g.beginPath(); g.moveTo(x, BANK); g.quadraticCurveTo(x + lean * 0.2, BANK - h * 0.6, top.x, top.y); g.stroke();
    g.lineWidth = 3;
    for (let k = 0; k < 8; k++) {
      const a = -Math.PI + (k / 7) * Math.PI, dx = Math.cos(a) * 44, dy = Math.sin(a) * 26;
      g.beginPath(); g.moveTo(top.x, top.y); g.quadraticCurveTo(top.x + dx * 0.55, top.y + dy - 16, top.x + dx, top.y + dy + 20); g.stroke();
    }
  };
  palm(604, 126, 6); palm(1100, 150, -10); palm(1176, 112, 8); palm(1006, 96, -4); palm(726, 90, 5);
  g.fillStyle = '#0f1a24';
  for (const [cx, cy, r] of [[600, 420, 40], [740, 446, 30], [900, 462, 18], [1120, 440, 34], [1190, 426, 36]] as const) { g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill(); }

  // ----- the bank, the crowd and the flags -----
  g.fillStyle = '#20101c'; g.fillRect(560, BANK, CARD_W - 560, 16);
  g.fillStyle = '#2d1a28'; for (let i = 0; i < 26; i++) g.fillRect(566 + i * 25, BANK - 3, 6, 19);
  for (let i = 0; i < 120; i++) {
    const x = 566 + i * 5.3, h = 6 + unit(i + 200) * 5;
    g.fillStyle = '#12091a'; g.beginPath(); g.arc(x, BANK - 4 - h, 2.6, 0, Math.PI * 2); g.fill(); g.fillRect(x - 2.4, BANK - 4 - h + 2, 4.8, h + 2);
    if (unit(i + 300) > 0.9) { g.fillStyle = '#ffe9a8'; g.fillRect(x + 1, BANK - 10 - h, 2, 2); }
  }
  flags.forEach((colour, i) => {
    for (const n of [0, 1]) {
      const x = 640 + i * 108 + n * 52 + unit(i * 3 + n) * 14, h = 64 + unit(i + n * 9) * 30;
      g.strokeStyle = '#1a0f1c'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, BANK - 8); g.lineTo(x, BANK - 8 - h); g.stroke();
      g.fillStyle = n ? mix(colour, '#000000', 0.2) : colour;
      g.beginPath(); g.moveTo(x, BANK - 8 - h); g.quadraticCurveTo(x + 22, BANK - 8 - h + 6, x + 38, BANK - 8 - h + 2); g.quadraticCurveTo(x + 24, BANK - 8 - h + 16, x + 36, BANK - 8 - h + 28); g.quadraticCurveTo(x + 18, BANK - 8 - h + 22, x, BANK - 8 - h + 30); g.closePath(); g.fill();
    }
  });
  // Strings of lights across the street.
  for (const [y0, sag] of [[392, 26], [428, 18]] as const) {
    const pts = lanternString(34, 560, CARD_W + 10, y0, sag);
    g.strokeStyle = 'rgba(30,16,26,0.7)'; g.lineWidth = 1.2; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
    for (const p of pts) {
      const bulb = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 9);
      bulb.addColorStop(0, 'rgba(255,230,150,1)'); bulb.addColorStop(1, 'rgba(255,200,90,0)');
      g.fillStyle = bulb; g.fillRect(p.x - 9, p.y - 9, 18, 18);
    }
  }

  // ----- the river: the town upside down, and the cruise boat -----
  const water = g.createLinearGradient(0, BANK + 16, 0, CARD_H);
  water.addColorStop(0, '#5a2a44'); water.addColorStop(0.35, '#241236'); water.addColorStop(1, '#0a0820');
  g.fillStyle = water; g.fillRect(0, BANK + 16, CARD_W, CARD_H - BANK - 16);
  for (let i = 0; i < 90; i++) {
    const x = 600 + unit(i + 900) * 600, y = BANK + 22 + unit(i + 950) * 120, w = 14 + unit(i + 975) * 60;
    const warm = x > 1090 ? 'rgba(255,200,110,0.5)' : x > 740 ? 'rgba(255,100,60,0.32)' : 'rgba(255,170,80,0.3)';
    g.fillStyle = warm; g.fillRect(x, y, w, 2.2);
  }
  // The boat: a low white hull, a lit cabin and a row of passengers.
  const bx = 880, by = 540;
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.ellipse(bx + 80, by + 28, 110, 8, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#f2ebe0'; g.beginPath(); g.moveTo(bx - 4, by + 8); g.lineTo(bx + 176, by + 8); g.lineTo(bx + 160, by + 26); g.lineTo(bx + 14, by + 26); g.closePath(); g.fill();
  g.fillStyle = '#ffcf6a'; g.fillRect(bx + 12, by - 12, 142, 18);
  g.fillStyle = '#c0392b'; g.fillRect(bx + 6, by - 18, 154, 7);
  g.fillStyle = '#2a1428'; for (let i = 0; i < 16; i++) { g.beginPath(); g.arc(bx + 20 + i * 8.6, by - 3, 3.2, 0, Math.PI * 2); g.fill(); }

  // ----- the card: the dark on the left that the words stand on -----
  const shade = g.createLinearGradient(0, 0, 760, 0);
  shade.addColorStop(0, 'rgba(5,7,22,0.95)'); shade.addColorStop(0.55, 'rgba(5,7,22,0.82)'); shade.addColorStop(1, 'rgba(5,7,22,0)');
  g.fillStyle = shade; g.fillRect(0, 0, 780, CARD_H);
  g.strokeStyle = 'rgba(255,255,255,0.3)'; g.lineWidth = 2; g.beginPath(); g.roundRect(14, 14, CARD_W - 28, CARD_H - 28, 22); g.stroke();

  try {
    const mark = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg())}`);
    g.drawImage(mark, 44, 30, 44, 44);
    g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(44, 30, 44, 44, 10); g.stroke();
  } catch { /* the card is whole without it */ }
  text('KEMPEN 222', 98, 61, `700 17px ${FONT}`, 'rgba(255,255,255,0.85)');
  const pillFont = `800 13px ${FONT}`;
  const pillW = measureWith(pillFont)(pill) + 28;
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.beginPath(); g.roundRect(CARD_W - 60 - pillW, 38, pillW, 30, 15); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 1.5; g.beginPath(); g.roundRect(CARD_W - 60 - pillW, 38, pillW, 30, 15); g.stroke();
  text(pill, CARD_W - 60 - pillW / 2, 58, pillFont, WHITE, 'center');

  // The words.
  const left = 56, width = 540;
  text(data.kicker.toUpperCase(), left, 118, `600 16px ${FONT}`, 'rgba(255,255,255,0.78)');
  const fit = fitHeadline(data.headline.toUpperCase(), width, (s, size) => measureWith(`900 ${size}px ${FONT}`)(s));
  const size = Math.min(fit.size, 58);
  const lines = size < fit.size ? wrap(data.headline.toUpperCase(), width, measureWith(`900 ${size}px ${FONT}`), 2) : fit.lines;
  g.save(); g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
  let y = 170;
  for (const line of lines) { text(line, left, y, `900 ${size}px ${FONT}`, WHITE); y += size + 4; }
  g.restore();
  if (data.body) {
    const bodyFont = `500 20px ${FONT}`;
    for (const line of wrap(data.body, width, measureWith(bodyFont), 2)) { text(line, left, y + 6, bodyFont, 'rgba(255,255,255,0.9)'); y += 27; }
  }

  // The hero figure, and the lanterns beneath it: one for each seat of the assembly.
  const heroFont = `900 118px ${FONT}`;
  g.save(); g.shadowColor = 'rgba(255,170,80,0.55)'; g.shadowBlur = 26;
  text(data.hero.value, left - 4, 412, heroFont, WHITE);
  g.restore();
  const heroW = measureWith(heroFont)(data.hero.value);
  text(data.hero.label.toUpperCase(), left + heroW + 16, 372, `800 20px ${FONT}`, WHITE);
  if (data.hero.sub) text(data.hero.sub, left + heroW + 16, 398, `500 17px ${FONT}`, 'rgba(255,255,255,0.8)');
  if (data.chamber) {
    const seats = data.chamber.seats;
    const pts = lanternString(seats.length, left + 6, 600, 446, 20);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 1.4; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y))); g.stroke();
    pts.forEach((p, i) => {
      const on = i < data.chamber!.mine;
      if (on) {
        const halo = g.createRadialGradient(p.x, p.y + 8, 2, p.x, p.y + 8, 22);
        halo.addColorStop(0, 'rgba(255,230,160,0.85)'); halo.addColorStop(1, 'rgba(255,200,90,0)');
        g.fillStyle = halo; g.fillRect(p.x - 22, p.y - 14, 44, 44);
      }
      g.fillStyle = on ? WHITE : seats[i]; g.globalAlpha = on ? 1 : 0.72;
      g.beginPath(); g.roundRect(p.x - 6, p.y + 2, 12, 17, 5); g.fill();
      g.globalAlpha = 1;
      g.fillStyle = on ? seats[i] : 'rgba(0,0,0,0.35)'; g.fillRect(p.x - 3, p.y + 7, 6, 7);
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(p.x - 1, p.y - 1, 2, 4);
    });
  }

  // The figures.
  const stats = data.stats.slice(0, 4);
  const gap = 10, tileW = (554 - gap * (stats.length - 1)) / Math.max(1, stats.length), tileTop = 514;
  stats.forEach((st, i) => {
    const tx2 = left + i * (tileW + gap);
    g.fillStyle = 'rgba(0,0,0,0.38)'; g.beginPath(); g.roundRect(tx2, tileTop, tileW, 66, 14); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.16)'; g.lineWidth = 1; g.beginPath(); g.roundRect(tx2, tileTop, tileW, 66, 14); g.stroke();
    text(st.value, tx2 + 14, tileTop + 29, `900 26px ${FONT}`, WHITE);
    // A label that does not fit on one line takes a second, rather than being cut short.
    const lf = `700 10.5px ${FONT}`;
    wrap(st.label.toUpperCase(), tileW - 22, measureWith(lf), 2).forEach((line, k) => text(line, tx2 + 14, tileTop + 44 + k * 13, lf, 'rgba(255,255,255,0.7)'));
  });

  // The leader, in a ring of light on the sky at the top right.
  if (data.portrait) {
    const px = 905, py = 150, r = 40;
    try {
      const img = await loadImage(data.portrait.src);
      g.save(); g.shadowColor = 'rgba(255,200,120,0.7)'; g.shadowBlur = 22; g.fillStyle = '#10142e'; g.beginPath(); g.arc(px, py, r + 4, 0, Math.PI * 2); g.fill(); g.restore();
      g.save(); g.beginPath(); g.arc(px, py, r, 0, Math.PI * 2); g.clip(); g.imageSmoothingQuality = 'high'; g.drawImage(img, px - r, py - r, r * 2, r * 2); g.restore();
      g.strokeStyle = WHITE; g.lineWidth = 3; g.beginPath(); g.arc(px, py, r + 2, 0, Math.PI * 2); g.stroke();
    } catch { /* the card is whole without it */ }
  }

  text(data.tagline, left, 612, `500 12px ${FONT}`, 'rgba(255,255,255,0.6)');
  text(data.fiction, CARD_W - 60, 612, `500 12px ${FONT}`, 'rgba(255,255,255,0.7)', 'right');
}
