import { isPicture } from '../state/identity';

/** The biggest file read at all; a phone camera's photo is well under this. */
const FILE_MAX = 20_000_000;

/** Sizes to try, largest first, until the picture is small enough to keep in a saved game. */
const SIZES = { photo: [192, 144, 112], flag: [128, 96, 64] };

async function open(file: File): Promise<{ source: CanvasImageSource; width: number; height: number; done(): void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bitmap, width: bitmap.width, height: bitmap.height, done: () => bitmap.close() };
    } catch { /* fall through to an image element, which some browsers decode better */ }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('unreadable')); img.src = url; });
  return { source: img, width: img.naturalWidth, height: img.naturalHeight, done: () => URL.revokeObjectURL(url) };
}

/**
 * Turns a picture the player picked into a small centred square, as text that can be kept in a saved game, or null if it
 * is not a picture the game can use. Nothing leaves the device: it is read, shrunk and kept here.
 * A leader's photo is a JPEG; a flag is a PNG so that a logo with clear corners keeps them.
 */
export async function readPicture(file: File, kind: 'photo' | 'flag'): Promise<string | null> {
  if (!file.type.startsWith('image/') || file.size > FILE_MAX) return null;
  let image;
  try { image = await open(file); } catch { return null; }
  try {
    if (!image.width || !image.height) return null;
    const side = Math.min(image.width, image.height);
    const sx = (image.width - side) / 2, sy = (image.height - side) / 2;
    for (const size of SIZES[kind]) {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      if (kind === 'photo') { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size); }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image.source, sx, sy, side, side, 0, 0, size, size);
      const url = kind === 'photo' ? canvas.toDataURL('image/jpeg', 0.85) : canvas.toDataURL('image/png');
      if (isPicture(url)) return url;
    }
    return null;
  } finally {
    image.done();
  }
}
