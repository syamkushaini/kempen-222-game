export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
export const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
export const logit = (p: number) => Math.log(p / (1 - p));

/**
 * Softmax over the entries where `mask` is true; masked-out entries get 0.
 * Writes into `out` and returns it.
 */
export function softmaxMasked(logits: number[], mask: boolean[], out: number[]): number[] {
  let max = -Infinity;
  for (let i = 0; i < logits.length; i++) if (mask[i] && logits[i] > max) max = logits[i];
  let sum = 0;
  for (let i = 0; i < logits.length; i++) {
    out[i] = mask[i] ? Math.exp(logits[i] - max) : 0;
    sum += out[i];
  }
  if (sum > 0) for (let i = 0; i < logits.length; i++) out[i] /= sum;
  return out;
}

export function zeros(n: number): number[] {
  return new Array<number>(n).fill(0);
}

export function zeros2(rows: number, cols: number): number[][] {
  return Array.from({ length: rows }, () => zeros(cols));
}
