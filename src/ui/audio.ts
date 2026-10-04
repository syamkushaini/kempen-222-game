/**
 * Sound made in the browser from oscillators: short effects for things that
 * happen, and a quiet tune that writes itself as it goes. No audio files, so
 * the game stays small and works offline. Browsers only allow sound after the
 * player has clicked or pressed something; until then everything here is silent.
 */

export type Sfx = 'click' | 'tick' | 'ring' | 'good' | 'bad' | 'coin' | 'gavel' | 'seat' | 'seatWon' | 'seatLost' | 'fanfare' | 'badge';

interface Tone {
  /** Pitch in hertz; 0 for a burst of noise. */
  f: number;
  /** Seconds after the effect starts. */
  at: number;
  dur: number;
  wave?: OscillatorType;
  gain?: number;
  /** Pitch the tone glides to by its end. */
  to?: number;
}

const tone = (f: number, at: number, dur: number, wave: OscillatorType = 'triangle', gain = 0.12, to?: number): Tone => ({ f, at, dur, wave, gain, to });
const thump = (at: number): Tone[] => [tone(150, at, 0.14, 'sine', 0.4, 55), { f: 0, at, dur: 0.05, gain: 0.18 }];

export const SFX: Record<Sfx, Tone[]> = {
  click: [tone(700, 0, 0.035, 'triangle', 0.07)],
  tick: [tone(440, 0, 0.06, 'sine', 0.09), tone(660, 0.05, 0.07, 'sine', 0.06)],
  ring: [tone(880, 0, 0.09, 'sine'), tone(1175, 0.1, 0.09, 'sine'), tone(880, 0.26, 0.09, 'sine'), tone(1175, 0.36, 0.12, 'sine')],
  good: [tone(523.25, 0, 0.09), tone(659.25, 0.08, 0.09), tone(783.99, 0.16, 0.2)],
  bad: [tone(311.13, 0, 0.16, 'sawtooth', 0.05), tone(233.08, 0.13, 0.3, 'sawtooth', 0.05)],
  coin: [tone(987.77, 0, 0.06, 'square', 0.04), tone(1318.5, 0.06, 0.2, 'square', 0.04)],
  gavel: [...thump(0), ...thump(0.2)],
  seat: [tone(520, 0, 0.03, 'sine', 0.04)],
  seatWon: [tone(659.25, 0, 0.07, 'triangle', 0.13), tone(880, 0.06, 0.14, 'triangle', 0.13)],
  seatLost: [tone(392, 0, 0.08, 'triangle', 0.1), tone(293.66, 0.07, 0.18, 'triangle', 0.1)],
  fanfare: [tone(523.25, 0, 0.12), tone(659.25, 0.12, 0.12), tone(783.99, 0.24, 0.12), tone(1046.5, 0.36, 0.5), tone(392, 0.36, 0.5, 'triangle', 0.08)],
  badge: [tone(783.99, 0, 0.08, 'sine'), tone(987.77, 0.08, 0.08, 'sine'), tone(1174.66, 0.16, 0.08, 'sine'), tone(1567.98, 0.24, 0.35, 'sine')],
};

// ---------- the tune ----------

/** Two octaves of a five-note scale on D. */
export const SCALE = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 369.99, 440, 493.88, 587.33];
/** The bass note under each bar, as steps of the scale; the tune goes round these. */
const BASS = [0, 4, 3, 1];
export const BEATS = 8;
const BEAT_SECONDS = 0.46;

/**
 * One bar of melody: for each half-beat a step of the scale, or -1 for a
 * rest. A wandering line that never jumps far, the same every time for the
 * same bar number and seed.
 */
export function melodyBar(seed: number, bar: number): number[] {
  let x = (seed ^ Math.imul(bar + 1, 0x9e3779b1)) >>> 0;
  const next = () => { x = Math.imul(x ^ (x >>> 15), 0x2c1b3c6d) >>> 0; x = Math.imul(x ^ (x >>> 12), 0x297a2d39) >>> 0; x = (x ^ (x >>> 15)) >>> 0; return x / 4294967296; };
  let at = 5 + Math.floor(next() * 3);
  return Array.from({ length: BEATS }, (_, i) => {
    // Strong beats nearly always sound; the ones between, less often.
    if (next() > (i % 2 === 0 ? 0.8 : 0.35)) return -1;
    at = Math.min(SCALE.length - 1, Math.max(3, at + Math.round((next() - 0.5) * 4)));
    return at;
  });
}

type Ctor = typeof AudioContext;

class Sound {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private sfx = true;
  private music = false;
  private timer: ReturnType<typeof setInterval> | undefined;
  private bar = 0;
  private barAt = 0;
  private seed = 1;
  private last: Partial<Record<Sfx, number>> = {};

  /** Follows the player's settings. */
  configure(opts: { sfx: boolean; music: boolean }): void {
    this.sfx = opts.sfx;
    const was = this.music;
    this.music = opts.music;
    if (this.music && !was) this.startMusic();
    if (!this.music && was) this.stopMusic();
  }

  /** Call from a click or key press: browsers only start sound from one. */
  unlock(): void {
    if (!this.sfx && !this.music) return;
    if (!this.ctx) {
      const AC: Ctor | undefined = typeof window === 'undefined' ? undefined
        : window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.out = this.ctx.createGain();
        this.out.gain.value = 0.6;
        this.out.connect(this.ctx.destination);
      } catch { this.ctx = null; return; }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => undefined);
    if (this.music) this.startMusic();
  }

  /** Quiet while the page is in the background. */
  setVisible(visible: boolean): void {
    if (!this.ctx) return;
    if (!visible) void this.ctx.suspend().catch(() => undefined);
    else if (this.sfx || this.music) void this.ctx.resume().catch(() => undefined);
  }

  play(name: Sfx): void {
    const ctx = this.ctx;
    if (!this.sfx || !ctx || !this.out || ctx.state !== 'running') return;
    // The same effect twice in an instant is one effect, louder; let it be one.
    const now = ctx.currentTime;
    if (now - (this.last[name] ?? -1) < 0.04) return;
    this.last[name] = now;
    for (const t of SFX[name]) this.voice(t, now, this.out);
  }

  private voice(t: Tone, start: number, to: AudioNode, attack = 0.006): void {
    const ctx = this.ctx!;
    const at = start + t.at;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(t.gain ?? 0.12, at + attack);
    env.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(t.dur, attack + 0.01));
    env.connect(to);
    if (t.f === 0) {
      this.noise ??= this.makeNoise();
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1800;
      src.connect(filter).connect(env);
      src.start(at);
      src.stop(at + t.dur + 0.02);
      return;
    }
    const osc = ctx.createOscillator();
    osc.type = t.wave ?? 'triangle';
    osc.frequency.setValueAtTime(t.f, at);
    if (t.to) osc.frequency.exponentialRampToValueAtTime(t.to, at + t.dur);
    osc.connect(env);
    osc.start(at);
    osc.stop(at + t.dur + 0.05);
  }

  private makeNoise(): AudioBuffer {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.1), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private startMusic(): void {
    if (!this.ctx || !this.out || this.timer !== undefined) return;
    this.seed = (Date.now() & 0xffff) + 1;
    this.bar = 0;
    this.barAt = this.ctx.currentTime + 0.1;
    // Bars are written a little ahead of when they sound, so a busy page does not make the tune stumble.
    this.timer = setInterval(() => this.writeAhead(), 250);
    this.writeAhead();
  }

  private stopMusic(): void {
    clearInterval(this.timer);
    this.timer = undefined;
  }

  private writeAhead(): void {
    const ctx = this.ctx;
    if (!ctx || !this.out || ctx.state !== 'running') return;
    // After a pause the clock has moved on: pick the tune up from now rather than racing to catch up.
    if (this.barAt < ctx.currentTime) this.barAt = ctx.currentTime + 0.05;
    while (this.barAt < ctx.currentTime + 1) {
      const length = BEATS * BEAT_SECONDS;
      const bass = SCALE[BASS[this.bar % BASS.length]];
      this.voice({ f: bass, at: 0, dur: length * 1.05, wave: 'sine', gain: 0.05 }, this.barAt, this.out, 0.9);
      this.voice({ f: bass * 1.5, at: 0, dur: length * 1.05, wave: 'triangle', gain: 0.018 }, this.barAt, this.out, 1.2);
      melodyBar(this.seed, this.bar).forEach((step, i) => {
        if (step >= 0) this.voice({ f: SCALE[step], at: i * BEAT_SECONDS, dur: 1.1, wave: 'triangle', gain: 0.035 }, this.barAt, this.out!, 0.01);
      });
      this.bar++;
      this.barAt += length;
    }
  }
}

export const sound = new Sound();
