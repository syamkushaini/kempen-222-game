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
  /** Filter a noise burst: [type, cutoff]. Defaults to a low thump filter. */
  noise?: [BiquadFilterType, number];
  /** Seconds for the note to swell in; short by default for a crisp start. */
  attack?: number;
}

const tone = (f: number, at: number, dur: number, wave: OscillatorType = 'triangle', gain = 0.12, to?: number): Tone => ({ f, at, dur, wave, gain, to });
const thump = (at: number, gain = 0.4): Tone[] => [
  tone(170, at, 0.16, 'sine', gain, 48),
  tone(340, at, 0.05, 'triangle', gain * 0.22, 90),
  { f: 0, at, dur: 0.06, gain: 0.2, noise: ['lowpass', 1400] },
];

export const SFX: Record<Sfx, Tone[]> = {
  // A crisp tap with a bright edge, not a flat beep.
  click: [
    tone(1250, 0, 0.03, 'triangle', 0.06, 900),
    tone(2500, 0, 0.018, 'sine', 0.03),
    { f: 0, at: 0, dur: 0.015, gain: 0.05, noise: ['highpass', 5000] },
  ],
  // A wooden knock, two quick hits.
  tick: [
    tone(540, 0, 0.045, 'sine', 0.1, 420),
    tone(1620, 0, 0.02, 'triangle', 0.03),
    tone(810, 0.055, 0.05, 'sine', 0.06, 640),
  ],
  // A bell that rings twice, with its shimmer above.
  ring: [
    tone(880, 0, 0.12, 'sine'), tone(1760, 0, 0.08, 'sine', 0.03),
    tone(1175, 0.13, 0.12, 'sine'), tone(2350, 0.13, 0.08, 'sine', 0.03),
    tone(880, 0.3, 0.1, 'sine', 0.09),
    tone(1175, 0.42, 0.16, 'sine', 0.1), tone(2350, 0.42, 0.12, 'sine', 0.025),
  ],
  // Good news: a little rising arpeggio with a shine on top.
  good: [
    tone(523.25, 0, 0.1), tone(659.25, 0.07, 0.1), tone(783.99, 0.14, 0.12),
    tone(1046.5, 0.21, 0.28, 'triangle', 0.1),
    tone(2093, 0.21, 0.18, 'sine', 0.025),
  ],
  // Bad news: two sour notes sinking together.
  bad: [
    tone(311.13, 0, 0.18, 'sawtooth', 0.045, 293.66),
    tone(233.08, 0.14, 0.32, 'sawtooth', 0.045, 220),
    tone(466.16, 0.14, 0.3, 'sine', 0.02, 440),
  ],
  // Money: the classic two bright pings, now with a sparkle.
  coin: [
    tone(987.77, 0, 0.07, 'square', 0.035),
    tone(1975.5, 0, 0.05, 'sine', 0.02),
    tone(1318.5, 0.07, 0.22, 'square', 0.035),
    tone(2637, 0.07, 0.15, 'sine', 0.02),
  ],
  // The Speaker's gavel: two heavy knocks on wood.
  gavel: [...thump(0), ...thump(0.22, 0.32)],
  // One seat flips on the tally: a soft pop.
  seat: [tone(620, 0, 0.035, 'sine', 0.05, 520)],
  // Your seat: a warm two-note lift with a third above.
  seatWon: [
    tone(659.25, 0, 0.08, 'triangle', 0.12),
    tone(830.61, 0.05, 0.08, 'triangle', 0.1),
    tone(987.77, 0.1, 0.18, 'triangle', 0.12),
    tone(1975.5, 0.1, 0.12, 'sine', 0.02),
  ],
  // Their seat: two notes sliding down.
  seatLost: [
    tone(415.3, 0, 0.09, 'triangle', 0.09, 392),
    tone(311.13, 0.08, 0.2, 'triangle', 0.09, 293.66),
  ],
  // Victory: a brassy call, stacked thirds, held high at the end.
  fanfare: [
    tone(523.25, 0, 0.12, 'sawtooth', 0.05), tone(523.25, 0, 0.12, 'triangle', 0.09),
    tone(659.25, 0.12, 0.12, 'sawtooth', 0.05), tone(659.25, 0.12, 0.12, 'triangle', 0.09),
    tone(783.99, 0.24, 0.12, 'sawtooth', 0.05), tone(783.99, 0.24, 0.12, 'triangle', 0.09),
    tone(1046.5, 0.36, 0.55, 'sawtooth', 0.045), tone(1046.5, 0.36, 0.55, 'triangle', 0.1),
    tone(659.25, 0.36, 0.55, 'triangle', 0.06), tone(392, 0.36, 0.55, 'triangle', 0.06),
    tone(2093, 0.42, 0.3, 'sine', 0.02),
  ],
  // An honour earned: a quick climb of glassy notes.
  badge: [
    tone(783.99, 0, 0.08, 'sine'), tone(987.77, 0.07, 0.08, 'sine'),
    tone(1174.66, 0.14, 0.08, 'sine'), tone(1567.98, 0.21, 0.12, 'sine'),
    tone(2093, 0.28, 0.3, 'sine', 0.09), tone(3136, 0.28, 0.2, 'sine', 0.02),
  ],
};

// ---------- the tune ----------

/** Two octaves of a five-note scale on D. */
export const SCALE = [146.83, 164.81, 185, 220, 246.94, 293.66, 329.63, 369.99, 440, 493.88, 587.33];
/** The bass note under each bar, as steps of the scale; the tune goes round these. */
const BASS = [0, 4, 3, 1];
/** A triad over each bass step, as steps of the scale, for the slow pad. */
const CHORDS = [
  [0, 2, 4],
  [4, 6, 8],
  [3, 5, 7],
  [1, 3, 5],
];
export const BEATS = 8;
const BEAT_SECONDS = 0.44;

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
  /** Echo send for the tune's melody, so the line hangs in the air a little. */
  private echo: DelayNode | null = null;
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
        // Everything goes through a gentle low-pass, so the game never sounds harsh.
        this.out = this.ctx.createGain();
        this.out.gain.value = 0.6;
        const warmth = this.ctx.createBiquadFilter();
        warmth.type = 'lowpass';
        warmth.frequency.value = 7500;
        this.out.connect(warmth).connect(this.ctx.destination);
        // A short echo, fed only by the melody.
        this.echo = this.ctx.createDelay(1);
        this.echo.delayTime.value = BEAT_SECONDS * 1.5;
        const back = this.ctx.createGain();
        back.gain.value = 0.32;
        const wet = this.ctx.createGain();
        wet.gain.value = 0.5;
        this.echo.connect(back).connect(this.echo);
        this.echo.connect(wet).connect(this.out);
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
    const swell = t.attack ?? attack;
    env.gain.setValueAtTime(0.0001, at);
    env.gain.linearRampToValueAtTime(t.gain ?? 0.12, at + swell);
    env.gain.exponentialRampToValueAtTime(0.0001, at + Math.max(t.dur, swell + 0.01));
    env.connect(to);
    if (t.f === 0) {
      this.noise ??= this.makeNoise();
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const filter = ctx.createBiquadFilter();
      const [type, freq] = t.noise ?? ['lowpass', 1800];
      filter.type = type;
      filter.frequency.value = freq;
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

  /** A soft drum kit for one bar: kick on the strong beats, hats between. */
  private drums(at: number): void {
    if (!this.out) return;
    for (let i = 0; i < BEATS; i++) {
      const t = at + i * BEAT_SECONDS;
      if (i % 2 === 0) {
        // Kick: a low sine that drops away fast, deepest on the first beat.
        const hard = i === 0;
        this.voice({ f: hard ? 120 : 105, at: 0, dur: 0.12, wave: 'sine', gain: hard ? 0.16 : 0.1, to: 42 }, t, this.out, 0.004);
      } else {
        // Hat: a tick of bright noise, swung a touch late.
        this.voice({ f: 0, at: 0.03, dur: 0.03, gain: 0.028, noise: ['highpass', 6500] }, t, this.out, 0.002);
      }
    }
  }

  private writeAhead(): void {
    const ctx = this.ctx;
    const out = this.out;
    if (!ctx || !out || ctx.state !== 'running') return;
    // After a pause the clock has moved on: pick the tune up from now rather than racing to catch up.
    if (this.barAt < ctx.currentTime) this.barAt = ctx.currentTime + 0.05;
    while (this.barAt < ctx.currentTime + 1) {
      const length = BEATS * BEAT_SECONDS;
      const chord = this.bar % BASS.length;
      const bass = SCALE[BASS[chord]];
      this.drums(this.barAt);
      // Bass: a round sine with its fifth breathing under it.
      this.voice({ f: bass / 2, at: 0, dur: length * 1.02, wave: 'sine', gain: 0.07 }, this.barAt, out, 0.5);
      this.voice({ f: bass * 0.75, at: length / 2, dur: length * 0.5, wave: 'sine', gain: 0.028 }, this.barAt, out, 0.6);
      // Pad: the bar's chord, swelling in and out slowly.
      for (const step of CHORDS[chord]) {
        this.voice({ f: SCALE[step], at: 0, dur: length * 1.05, wave: 'triangle', gain: 0.016, attack: length * 0.4 }, this.barAt, out, length * 0.4);
        this.voice({ f: SCALE[step] * 2, at: 0, dur: length * 1.05, wave: 'sine', gain: 0.008, attack: length * 0.5 }, this.barAt, out, length * 0.5);
      }
      // Melody: the wandering line, sent through the echo.
      melodyBar(this.seed, this.bar).forEach((step, i) => {
        if (step >= 0) {
          const note: Tone = { f: SCALE[step], at: i * BEAT_SECONDS, dur: 0.9, wave: 'triangle', gain: 0.038 };
          this.voice(note, this.barAt, out, 0.01);
          if (this.echo) this.voice(note, this.barAt, this.echo, 0.01);
        }
      });
      this.bar++;
      this.barAt += length;
    }
  }
}

export const sound = new Sound();
