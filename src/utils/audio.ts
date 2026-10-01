// Professional Game Audio Engine with Royalty-Free CC0/CC-BY Audio & Background Music
// Music: "Carefree" by Kevin MacLeod (incompetech.com, CC-BY 3.0)
// SFX: Public Domain (CC0) tactile sounds (Tap, Chime, Coin, Applause )

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicEnabled: boolean = true;
  private bgmAudio: HTMLAudioElement | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private isUserInteracted: boolean = false;

  private soundUrls = {
    tap: '/sounds/tap.wav',
    chime: '/sounds/chime.ogg',
    coin: '/sounds/coin.ogg',
    victory: '/sounds/victory.ogg',
    bgm: '/sounds/bgm.ogg',
  };

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-unlock audio on user's first touch/click (resolves mobile/browser autoplay restrictions)
      const unlockAudio = () => {
        this.isUserInteracted = true;
        this.initCtx();
        if (this.musicEnabled) {
          this.playBgm();
        }
        window.removeEventListener('pointerdown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
      };

      window.addEventListener('pointerdown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
      window.addEventListener('click', unlockAudio, { passive: true });

      // Preload audio buffers
      this.preloadSounds();
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private async preloadSounds() {
    if (typeof window === 'undefined') return;
    const entries = [
      ['tap', this.soundUrls.tap],
      ['chime', this.soundUrls.chime],
      ['coin', this.soundUrls.coin],
      ['victory', this.soundUrls.victory],
    ];

    for (const [key, url] of entries) {
      try {
        const resp = await fetch(url);
        if (resp.ok) {
          const arrayBuffer = await resp.arrayBuffer();
          this.initCtx();
          if (this.ctx) {
            this.ctx.decodeAudioData(
              arrayBuffer,
              (decoded) => this.bufferCache.set(key, decoded),
              () => {}
            );
          }
        }
      } catch {
        // Fallback silently if offline or blocked
      }
    }
  }

  // Play a preloaded AudioBuffer via Web Audio (0ms latency)
  private playBuffer(key: string, rate: number = 1.0, gainVal: number = 0.5): boolean {
    if (!this.soundEnabled) return false;
    try {
      this.initCtx();
      const buffer = this.bufferCache.get(key);
      if (this.ctx && buffer) {
        const source = this.ctx.createBufferSource();
        const gainNode = this.ctx.createGain();

        source.buffer = buffer;
        source.playbackRate.value = rate;
        gainNode.gain.value = gainVal;

        source.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        source.start(0);
        return true;
      }
    } catch {
      // Fallback
    }
    return false;
  }

  // HTML5 audio fallback
  private playAudioElement(url: string, volume: number = 0.5) {
    if (!this.soundEnabled) return;
    try {
      const audio = new Audio(url);
      audio.volume = volume;
      audio.play().catch(() => {});
    } catch {
      // Fallback
    }
  }

  // ===== BACKGROUND MUSIC CONTROLS =====

  public playBgm() {
    if (!this.musicEnabled) return;
    try {
      if (!this.bgmAudio && typeof window !== 'undefined') {
        this.bgmAudio = new Audio(this.soundUrls.bgm);
        this.bgmAudio.loop = true;
        this.bgmAudio.volume = 0.22; // Pleasant ambient volume
      }
      if (this.bgmAudio && this.bgmAudio.paused) {
        this.bgmAudio.play().catch(() => {
          // Autoplay was blocked, will resume on user interaction
        });
      }
    } catch {
      // Audio fallback
    }
  }

  public pauseBgm() {
    if (this.bgmAudio && !this.bgmAudio.paused) {
      this.bgmAudio.pause();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.playBgm();
    } else {
      this.pauseBgm();
    }
  }

  public toggleMusic(): boolean {
    this.setMusicEnabled(!this.musicEnabled);
    return this.musicEnabled;
  }

  public isMusicOn(): boolean {
    return this.musicEnabled;
  }

  // ===== SOUND EFFECTS CONTROLS =====

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setMuted(muted: boolean) {
    this.setSoundEnabled(!muted);
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  // 1. Tactile letter tap / drag pop (pitch scales with word length)
  public playLetterTap(step: number = 0) {
    if (!this.soundEnabled) return;

    // Calculate slight pitch variation for playful game feel
    const rate = 1.0 + Math.min(step, 8) * 0.05;
    const played = this.playBuffer('tap', rate, 0.45);

    if (!played) {
      // Synth fallback
      try {
        this.initCtx();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const baseFreq = 420 + Math.min(step, 8) * 45;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
      } catch {}
    }
  }

  // 2. Juicy coin pickup sound
  public playCoin() {
    if (!this.soundEnabled) return;
    const played = this.playBuffer('coin', 1.0, 0.5);

    if (!played) {
      this.playAudioElement(this.soundUrls.coin, 0.5);
    }
  }

  // 3. Word found success chime
  public playWordFound() {
    if (!this.soundEnabled) return;
    const played = this.playBuffer('chime', 1.0, 0.6);

    if (!played) {
      this.playAudioElement(this.soundUrls.chime, 0.6);
    }
  }

  // 4. Level complete celebration applause
  public playVictory() {
    if (!this.soundEnabled) return;
    const played = this.playBuffer('victory', 1.0, 0.65);

    if (!played) {
      this.playAudioElement(this.soundUrls.victory, 0.65);
    }
  }

  // 5. Sparkle / hint sound
  public playSparkle() {
    if (!this.soundEnabled) return;
    const played = this.playBuffer('chime', 1.3, 0.4);

    if (!played) {
      try {
        this.initCtx();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [800, 1000, 1300, 1600].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        });
      } catch {}
    }
  }

  // 6. Wheel tick / button click
  public playTick() {
    this.playLetterTap(0);
  }

  // 7. Mascot chirp / cheer
  public playChirp() {
    this.playLetterTap(2);
  }
}

export const audio = new SoundEngine();
