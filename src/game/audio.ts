import { gameConfig as c } from '../config/gameConfig';
export class Audio {
  ctx?: AudioContext; muted = false; paused = true; beat = 0;
  constructor() { window.setInterval(() => { if (!this.paused && !this.muted) { const notes = [261.63, 329.63, 392, 523.25, 440, 392, 329.63, 293.66]; this.tone(notes[this.beat++ % notes.length], .22, c.audio.musicVolume); } }, 420); }
  unlock() { this.ctx ??= new AudioContext(); void this.ctx.resume().catch(() => {}); this.paused = false; }
  tone(hz: number, duration = .12, volume: number = c.audio.sfxVolume) {
    if (!this.ctx || this.muted || this.ctx.state !== 'running') return;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'triangle'; o.frequency.value = hz;
    g.gain.setValueAtTime(volume, this.ctx.currentTime); g.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + duration);
    o.connect(g); g.connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + duration);
  }
  jingle() { [523, 659, 784, 1047].forEach((n, i) => setTimeout(() => this.tone(n, .4), i * 170)); }
}
export const audio = new Audio();
