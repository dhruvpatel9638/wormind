import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Pure React Native Audio Engine (zero browser / WebView)
// Uses local offline assets bundled directly in the app
const SOUND_ASSETS = {
  bgm: require('../../assets/sounds/bgm.mp3'),
  btn_1: require('../../assets/sounds/btn_1.wav'),
  btn_3: require('../../assets/sounds/btn_3.wav'),
  level_win: require('../../assets/sounds/level win.mp3'),
};

class NativeSoundEngine {
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private isInGame: boolean = false;
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
    // Auto-play BGM if music is enabled and not in game
    if (this.isMusicEnabled && !this.isInGame) {
      setTimeout(() => this.playBgm(), 500);
    }
  }

  // ===== BACKGROUND MUSIC =====
  public async playBgm() {
    if (!this.isMusicEnabled || this.isInGame) return;
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

  public setInGame(inGame: boolean) {
    if (this.isInGame === inGame) return;
    this.isInGame = inGame;
    if (inGame) {
      this.pauseBgm();
    } else {
      if (this.isMusicEnabled) {
        this.playBgm();
      }
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (enabled && !this.isInGame) {
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
    this.playSound(SOUND_ASSETS.btn_1, 0.4);
  }

  public playCoin() {
    this.playSound(SOUND_ASSETS.btn_3, 0.6);
  }

  public playWordFound() {
    this.playSound(SOUND_ASSETS.btn_1, 0.85);
  }

  private victoryPlayer: any = null;
  private victoryTimer: any = null;
  private fadeInterval: any = null;

  public playVictory() {
    if (!this.isSoundEnabled) return;
    try {
      this.playSound(SOUND_ASSETS.level_win, 0.9);
    } catch (e) {
      console.warn('Error playing victory sound:', e);
    }
  }

  public stopVictory() {
    // Keep empty or minimal to prevent errors if called elsewhere
  }

  public playSparkle() {
    this.playSound(SOUND_ASSETS.btn_1, 0.5);
  }

  public playGameOver() {
    this.playSound(SOUND_ASSETS.btn_3, 0.7);
  }

  public playTick() {
    this.playLetterTap(0);
  }

  public playChirp() {
    this.playLetterTap(1);
  }
}

export const nativeAudio = new NativeSoundEngine();
