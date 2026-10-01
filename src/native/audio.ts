import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Pure React Native Audio Engine (zero browser / WebView)
// Uses local offline assets bundled directly in the app
const SOUND_ASSETS = {
  bgm: require('../../assets/sounds/bgm.ogg'),
  chime: require('../../assets/sounds/chime.ogg'),
  coin: require('../../assets/sounds/coin.ogg'),
  tap: require('../../assets/sounds/tap.wav'),
  victory: require('../../assets/sounds/victory.ogg'),
};

class NativeSoundEngine {
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private bgmPlayer: any = null;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
      });
    } catch (e) {
      console.warn('Audio mode init error:', e);
    }
    // Auto-play BGM if music is enabled
    if (this.isMusicEnabled) {
      setTimeout(() => this.playBgm(), 500);
    }
  }

  // ===== BACKGROUND MUSIC =====
  public async playBgm() {
    if (!this.isMusicEnabled) return;
    try {
      if (!this.bgmPlayer) {
        this.bgmPlayer = createAudioPlayer(SOUND_ASSETS.bgm);
        this.bgmPlayer.loop = true;
        this.bgmPlayer.volume = 0.25;
      }
      this.bgmPlayer.play();
    } catch (e) {
      console.warn('Error playing BGM:', e);
    }
  }

  public pauseBgm() {
    try {
      if (this.bgmPlayer) {
        this.bgmPlayer.pause();
      }
    } catch (e) {}
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled) {
      this.playBgm();
    } else {
      this.pauseBgm();
    }
  }

  public toggleMusic(): boolean {
    this.setMusicEnabled(!this.isMusicEnabled);
    return this.isMusicEnabled;
  }

  // ===== SOUND EFFECTS =====
  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  public setMuted(muted: boolean) {
    this.setSoundEnabled(!muted);
  }

  private playSound(asset: any, volume: number = 0.7) {
    if (!this.isSoundEnabled) return;
    try {
      const player = createAudioPlayer(asset);
      player.volume = volume;
      player.play();
    } catch (e) {
      console.warn('Error playing SFX:', e);
    }
  }

  public playLetterTap(step: number = 0) {
    this.playSound(SOUND_ASSETS.tap, 0.4);
  }

  public playCoin() {
    this.playSound(SOUND_ASSETS.coin, 0.6);
  }

  public playWordFound() {
    this.playSound(SOUND_ASSETS.chime, 0.85);
  }

  private victoryPlayer: any = null;
  private victoryTimer: any = null;
  private fadeInterval: any = null;

  public playVictory() {
    if (!this.isSoundEnabled) return;
    try {
      this.stopVictory();
      this.victoryPlayer = createAudioPlayer(SOUND_ASSETS.victory);
      if (this.victoryPlayer) {
        this.victoryPlayer.volume = 0.9;
        this.victoryPlayer.play();
      }

      // Wait 3 seconds, then gradually fade out over 1 second (total 4 seconds)
      this.victoryTimer = setTimeout(() => {
        if (!this.victoryPlayer) return;
        let volume = 0.9;
        const fadeSteps = 20; // number of steps for a smooth fade
        const stepTime = 50; // 20 * 50ms = 1000ms (1 second fade)
        const volumeStep = volume / fadeSteps;

        this.fadeInterval = setInterval(() => {
          if (this.victoryPlayer) {
            volume -= volumeStep;
            if (volume <= 0.05) { // Stop precisely when near zero
              this.stopVictory();
            } else {
              this.victoryPlayer.volume = volume;
            }
          } else {
            this.stopVictory();
          }
        }, stepTime);
      }, 3000);
    } catch (e) {
      console.warn('Error playing victory sound:', e);
    }
  }

  public stopVictory() {
    if (this.victoryTimer) {
      clearTimeout(this.victoryTimer);
      this.victoryTimer = null;
    }
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    try {
      if (this.victoryPlayer) {
        this.victoryPlayer.pause();
        this.victoryPlayer = null;
      }
    } catch (e) {}
  }

  public playSparkle() {
    this.playSound(SOUND_ASSETS.chime, 0.5);
  }

  public playTick() {
    this.playLetterTap(0);
  }

  public playChirp() {
    this.playLetterTap(1);
  }
}

export const nativeAudio = new NativeSoundEngine();
