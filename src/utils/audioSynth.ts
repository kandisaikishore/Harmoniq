import { midiToFrequency } from './musicTheory';

export type InstrumentType = 'piano' | 'rhodes' | 'pluck' | 'synth';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private currentPlayingTimeoutIds: number[] = [];
  private volume: number = 0.7;
  public currentInstrument: InstrumentType = 'piano';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(val: number) {
    const clamped = Math.max(0, Math.min(1, val));
    this.volume = clamped;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.05);
    }
  }

  public setInstrument(inst: InstrumentType) {
    this.currentInstrument = inst;
  }

  public playNote(midi: number, duration: number = 0.8, delay: number = 0) {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const freq = midiToFrequency(midi);
    const startTime = this.ctx.currentTime + delay;

    if (this.currentInstrument === 'piano') {
      this.playPianoNote(freq, startTime, duration);
    } else if (this.currentInstrument === 'rhodes') {
      this.playRhodesNote(freq, startTime, duration);
    } else if (this.currentInstrument === 'pluck') {
      this.playPluckNote(freq, startTime, duration);
    } else {
      this.playSynthNote(freq, startTime, duration);
    }
  }

  private playPianoNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    // Rich multi-oscillator acoustic simulation
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);

    // slight detuning for natural acoustic chorus warmth
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, startTime); // 1st harmonic overtone

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.25, startTime);
    osc2.connect(overtoneGain);
    overtoneGain.connect(gainNode);

    osc1.connect(gainNode);
    gainNode.connect(this.masterGain);

    // Realistic ADSR
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.6, startTime + 0.015); // sharp attack
    gainNode.gain.exponentialRampToValueAtTime(0.3, startTime + 0.15);  // initial decay
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // natural release

    osc1.start(startTime);
    osc2.start(startTime);
    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration + 0.05);
  }

  private playRhodesNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const tine = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const tineGain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Bell-like high tine frequency (7th harmonic)
    tine.type = 'sine';
    tine.frequency.setValueAtTime(freq * 4, startTime);

    tineGain.gain.setValueAtTime(0.3, startTime);
    tineGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2); // quickly decays like metal bar

    tine.connect(tineGain);
    tineGain.connect(gainNode);
    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.5, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.25, startTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 1.2);

    osc.start(startTime);
    tine.start(startTime);
    osc.stop(startTime + duration * 1.2 + 0.05);
    tine.stop(startTime + duration * 1.2 + 0.05);
  }

  private playPluckNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    // Lowpass filter envelope for guitar pluck
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, startTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.7, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.9);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playSynthNote(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    osc.connect(gain);
    gain.connect(this.masterGain);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.5, startTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // Play an arpeggio sequence of MIDI notes
  public playArpeggio(
    midiNotes: number[],
    stepSeconds: number = 0.22,
    onNoteTrigger?: (midi: number) => void,
    onComplete?: () => void
  ) {
    this.stopPlayback();

    midiNotes.forEach((midi, idx) => {
      const delay = idx * stepSeconds;
      const timeoutId = window.setTimeout(() => {
        this.playNote(midi, stepSeconds * 2.5);
        if (onNoteTrigger) onNoteTrigger(midi);
      }, delay * 1000);
      this.currentPlayingTimeoutIds.push(timeoutId);
    });

    const totalDuration = midiNotes.length * stepSeconds;
    const finalTimeoutId = window.setTimeout(() => {
      if (onComplete) onComplete();
    }, (totalDuration + 0.5) * 1000);
    this.currentPlayingTimeoutIds.push(finalTimeoutId);
  }

  // Strum a chord (slight humanized stagger)
  public playStrum(
    midiNotes: number[],
    direction: 'down' | 'up' = 'down',
    onComplete?: () => void
  ) {
    this.stopPlayback();
    const sorted = [...midiNotes].sort((a, b) => direction === 'down' ? a - b : b - a);

    sorted.forEach((midi, idx) => {
      const delay = idx * 0.035; // 35ms pick strum offset
      const timeoutId = window.setTimeout(() => {
        this.playNote(midi, 2.2);
      }, delay * 1000);
      this.currentPlayingTimeoutIds.push(timeoutId);
    });

    const finalTimeoutId = window.setTimeout(() => {
      if (onComplete) onComplete();
    }, 2200);
    this.currentPlayingTimeoutIds.push(finalTimeoutId);
  }

  public stopPlayback() {
    this.currentPlayingTimeoutIds.forEach(id => clearTimeout(id));
    this.currentPlayingTimeoutIds = [];
  }
}

export const soundEngine = new SoundEngine();
