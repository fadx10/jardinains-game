// Web Audio API Procedural Synthesizer for Classic Jardinains retro sound effects
// Generates authentic 8-bit / 16-bit arcade audio procedurally (no external assets needed)

export type SoundEffect =
  | 'paddle'
  | 'wall'
  | 'brick_hit'
  | 'brick_break'
  | 'unbreakable_hit'
  | 'bonus_brick'
  | 'nain_hit'
  | 'nain_fall'
  | 'nain_bounce'
  | 'nain_smash'
  | 'nain_taunt'
  | 'splat'
  | 'poof'
  | 'freeze'
  | 'powerup'
  | 'powerup_multiball'
  | 'powerup_laser'
  | 'powerup_shield'
  | 'laser'
  | 'shield'
  | 'throw'
  | 'rock_hit'
  | 'ball_lost'
  | 'levelclear'
  | 'gameover'
  | 'win'
  | 'start'
  | 'countdown'
  | 'combo';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.65;

  public init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  public play(type: SoundEffect, options?: { pitchMult?: number }) {
    if (this.isMuted) return;

    try {
      this.init();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const pitch = options?.pitchMult || 1.0;

      switch (type) {
        // 1. Paddle Collision - Distinct rubbery arcade pop with upward ramp
        case 'paddle': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(560 * pitch, now + 0.08);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }

        // 2. Wall Bounce - Crisp solid metallic ping
        case 'wall': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(260 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(340 * pitch, now + 0.04);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.07);
          break;
        }

        // 3. Brick Hit (non-lethal / multi-hit brick) - Sharp retro blip
        case 'brick_hit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(460 * pitch, now);
          osc.frequency.setValueAtTime(580 * pitch, now + 0.03);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.08);
          break;
        }

        // 4. Brick Break - Satisfying crunchy disintegration burst
        case 'brick_break': {
          // Tonal crunch
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(700 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.16);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.19);

          // White noise debris pop
          const noiseBuffer = this.createNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            const noiseFilter = this.ctx.createBiquadFilter();
            const noiseGain = this.ctx.createGain();

            noise.buffer = noiseBuffer;
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.setValueAtTime(1200, now);

            noiseGain.gain.setValueAtTime(0.18, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noise.start(now);
            noise.stop(now + 0.15);
          }
          break;
        }

        // 4b. Unbreakable Brick - Dense solid metallic ricochet ping
        case 'unbreakable_hit': {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(820 * pitch, now);
          osc1.frequency.exponentialRampToValueAtTime(360 * pitch, now + 0.12);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1640 * pitch, now);
          osc2.frequency.exponentialRampToValueAtTime(480 * pitch, now + 0.08);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.masterGain);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.15);
          osc2.stop(now + 0.15);
          break;
        }

        // 4c. Bonus Brick Disintegration - Shimmering crystal chime arpeggio
        case 'bonus_brick': {
          const notes = [784, 988, 1318.5, 1568]; // G5, B5, E6, G6
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const noteStart = now + idx * 0.045;
            osc.frequency.setValueAtTime(freq * pitch, noteStart);

            gain.gain.setValueAtTime(0.3, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.16);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.17);
          });
          break;
        }

        // 5. Nain Hit (Ball hits gnome directly) - High-pitched comical squeak "Ouch!"
        case 'nain_hit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(750 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(1350 * pitch, now + 0.07);
          osc.frequency.exponentialRampToValueAtTime(550 * pitch, now + 0.15);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.17);
          break;
        }

        // 6. Nain Fall (Knocked off perch) - Slide whistle descending pitch
        case 'nain_fall': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(850 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(260 * pitch, now + 0.32);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.35);
          break;
        }

        // 7. Nain Bounce on Paddle (Signature Jardinains Juggling mechanic)
        // Escalates in pitch based on juggle streak
        case 'nain_bounce': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          const baseFreq = 300 * pitch;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.linearRampToValueAtTime(baseFreq * 3.2, now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.22);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        // 8. Nain Splat (Hits the floor) - Dense comedic cartoon thud
        case 'splat': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.23);
          break;
        }

        // 9. PowerUp Collected - Bright uplifting 4-note ascending chime
        case 'powerup':
        case 'powerup_multiball': {
          const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const noteStart = now + idx * 0.055;
            osc.frequency.setValueAtTime(freq * pitch, noteStart);

            gain.gain.setValueAtTime(0.22, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.12);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.13);
          });
          break;
        }

        // 10. Laser Cannon Shot - Futuristic zap
        case 'laser': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(950, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.09);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }

        // 11. Safety Shield Deflect
        case 'shield': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(350, now);
          osc.frequency.exponentialRampToValueAtTime(900, now + 0.16);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.21);
          break;
        }

        // 12. Nain Throws Rock
        case 'throw': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        }

        // 13. Rock Hits Paddle
        case 'rock_hit': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(190, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        // 14. Ball Lost
        case 'ball_lost': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(340, now);
          osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.39);
          break;
        }

        // 15. Level Clear Victory Fanfare
        case 'levelclear': {
          const fanfare = [
            { f: 523.25, d: 0.1 },
            { f: 659.25, d: 0.1 },
            { f: 783.99, d: 0.1 },
            { f: 1046.5, d: 0.25 },
          ];
          let timeOffset = 0;
          fanfare.forEach(item => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const noteStart = now + timeOffset;
            osc.frequency.setValueAtTime(item.f, noteStart);

            gain.gain.setValueAtTime(0.28, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + item.d + 0.15);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + item.d + 0.16);
            timeOffset += item.d;
          });
          break;
        }

        // 16. Game Over
        case 'gameover': {
          const sadTones = [392.0, 369.99, 349.23, 311.13];
          sadTones.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const noteStart = now + idx * 0.18;
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.25, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.26);
          });
          break;
        }

        // 17. Game Win Grand Finale
        case 'win': {
          const winNotes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
          winNotes.forEach((freq, idx) => {
            if (!this.ctx || !this.masterGain) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const noteStart = now + idx * 0.12;
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.3, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteStart);
            osc.stop(noteStart + 0.32);
          });
          break;
        }

        // 18. Start Game Blip
        case 'start': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.21);
          break;
        }

        // 19. Combo Trigger
        case 'combo': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(1200 * pitch, now + 0.12);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        // 20. Countdown Beep (3, 2, 1) and GO!
        case 'countdown': {
          const isGo = pitch >= 1.5;
          if (isGo) {
            // High triumphant chord
            [523.25, 659.25, 783.99, 1046.5].forEach(f => {
              if (!this.ctx || !this.masterGain) return;
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(f, now);
              gain.gain.setValueAtTime(0.2, now);
              gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
              osc.connect(gain);
              gain.connect(this.masterGain);
              osc.start(now);
              osc.stop(now + 0.36);
            });
          } else {
            // Clean retro countdown pip
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            const f = 440 * pitch;
            osc.frequency.setValueAtTime(f, now);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(now);
            osc.stop(now + 0.16);
          }
          break;
        }

        // 21. Juggled Nain Smashes Into Brick
        case 'nain_smash': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(450 * pitch, now);
          osc.frequency.exponentialRampToValueAtTime(120 * pitch, now + 0.12);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.15);
          break;
        }

        // Nain Taunt (randomly when bottom reached)
        case 'nain_taunt': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(600 * pitch, now);
          osc.frequency.linearRampToValueAtTime(800 * pitch, now + 0.05);
          osc.frequency.linearRampToValueAtTime(650 * pitch, now + 0.1);
          osc.frequency.linearRampToValueAtTime(850 * pitch, now + 0.15);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        // 22. Freeze / Ice Pot Hit
        case 'freeze': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200 * pitch, now);
          osc.frequency.linearRampToValueAtTime(400 * pitch, now + 0.2);
          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.23);
          break;
        }

        // 23. Poof Puff of Smoke
        case 'poof': {
          const noiseBuffer = this.createNoiseBuffer();
          if (noiseBuffer) {
            const noise = this.ctx.createBufferSource();
            const noiseFilter = this.ctx.createBiquadFilter();
            const noiseGain = this.ctx.createGain();
            noise.buffer = noiseBuffer;
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.setValueAtTime(800, now);
            noiseGain.gain.setValueAtTime(0.22, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.masterGain);
            noise.start(now);
            noise.stop(now + 0.19);
          }
          break;
        }

        default:
          break;
      }
    } catch {
      // Audio playback fails gracefully if context blocked by browser
    }
  }

  // Procedural 8-bit / Chiptune Arcade Background Music
  private musicGain: GainNode | null = null;
  private musicInterval: number | null = null;
  private isMusicMuted: boolean = false;
  private musicVolume: number = 0.25;
  private musicStep: number = 0;

  public setMusicEnabled(enabled: boolean) {
    this.isMusicMuted = !enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(
        this.isMusicMuted ? 0 : this.musicVolume,
        this.ctx.currentTime
      );
    }
    if (enabled && !this.musicInterval) {
      this.startMusic();
    } else if (!enabled && this.musicInterval) {
      this.stopMusic();
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && !this.isMusicMuted) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  public startMusic() {
    if (this.isMusicMuted) return;
    this.init();
    if (!this.ctx) return;
    if (this.musicInterval) return; // already playing

    if (!this.musicGain) {
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);
    }

    // A cheery, bouncy garden chiptune progression (C, Am, F, G)
    const melody = [
      // Bar 1 (C)
      523.25, 659.25, 783.99, 659.25, 1046.5, 783.99, 659.25, 783.99,
      // Bar 2 (Am)
      440.0, 523.25, 659.25, 523.25, 880.0, 659.25, 523.25, 659.25,
      // Bar 3 (F)
      349.23, 440.0, 523.25, 440.0, 698.46, 523.25, 440.0, 523.25,
      // Bar 4 (G)
      392.0, 493.88, 587.33, 493.88, 783.99, 587.33, 493.88, 392.0,
    ];
    const bass = [
      130.81, 130.81, 130.81, 130.81,
      110.0, 110.0, 110.0, 110.0,
      87.31, 87.31, 87.31, 87.31,
      98.0, 98.0, 98.0, 98.0,
    ];

    const stepDuration = 0.16; // 120 bpm eighth notes

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMusicMuted) return;
      const now = this.ctx.currentTime;
      const noteFreq = melody[this.musicStep % melody.length];
      const bassIndex = Math.floor((this.musicStep % melody.length) / 2);
      const bassFreq = bass[bassIndex % bass.length];

      // Play lead melody note
      if (noteFreq) {
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(noteFreq, now);

        noteGain.gain.setValueAtTime(0.09, now);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 0.9);

        osc.connect(noteGain);
        noteGain.connect(this.musicGain);
        osc.start(now);
        osc.stop(now + stepDuration);
      }

      // Play bass pulse on beats
      if (this.musicStep % 2 === 0 && bassFreq) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(bassFreq, now);

        bassGain.gain.setValueAtTime(0.12, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGain);
        bassOsc.start(now);
        bassOsc.stop(now + stepDuration * 1.9);
      }

      this.musicStep = (this.musicStep + 1) % melody.length;
    }, stepDuration * 1000) as unknown as number;
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicStep = 0;
  }
}

export const soundEngine = new SoundEngine();

export function playSound(type: SoundEffect, options?: { pitchMult?: number }) {
  soundEngine.play(type, options);
}

export function startMusic() {
  soundEngine.startMusic();
}

export function stopMusic() {
  soundEngine.stopMusic();
}

export function setMusicEnabled(enabled: boolean) {
  soundEngine.setMusicEnabled(enabled);
}

export function setMusicVolume(vol: number) {
  soundEngine.setMusicVolume(vol);
}

export function setSoundMuted(muted: boolean) {
  soundEngine.setMuted(muted);
}

export function setSoundVolume(vol: number) {
  soundEngine.setVolume(vol);
}
