import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { AppState, AppStateStatus } from 'react-native';

// Pure React Native Audio Engine (zero browser / WebView)
// Uses local offline assets bundled directly in the app
const SOUND_ASSETS = {
  bgm: require('../../assets/sounds/bgm.mp3'),
  letter_tap: require('../../assets/sounds/letter_tap.wav'),
  btn_1: require('../../assets/sounds/btn_1.wav'),
  btn_3: require('../../assets/sounds/btn_3.wav'),
  level_win: require('../../assets/sounds/xmer-soft-treble-win-fade-out-ending-sound-effect-416829.mp3'),
};

type SoundEffect = Exclude<keyof typeof SOUND_ASSETS, 'bgm'>;
type SoundVoice = {
  player: ReturnType<typeof createAudioPlayer>;
  ready: boolean;
  revision: number;
  lastStarted: number;
  rewind?: Promise<void>;
};

class NativeSoundEngine {
  private isSoundEnabled: boolean = true;
  private isMusicEnabled: boolean = true;
  private isInGame: boolean = false;
  private isAppActive: boolean = true;
  private bgmPlayer: any = null;
  private soundPools = new Map<SoundEffect, SoundVoice[]>();
  private soundSequence = 0;
  private pendingLetterTaps = 0;
  private letterTapTimer: ReturnType<typeof setTimeout> | null = null;
  private lastLetterTapAt = -Infinity;

  constructor() {
    this.initAudio();
    this.listenToAppState();
  }

  private listenToAppState() {
    AppState.addEventListener('change', (nextState: AppStateStatus) => {
      this.handleAppStateChange(nextState);
    });
  }

  public handleAppStateChange(nextState: AppStateStatus) {
    const isNowActive = nextState === 'active';
    if (this.isAppActive === isNowActive) return;
    this.isAppActive = isNowActive;

    if (!isNowActive) {
      // App went to background / screen locked / switched to another application
      this.pauseBgm();
      this.stopAllSounds();
    } else {
      // App returned to foreground
      if (this.isMusicEnabled && !this.isInGame) {
        this.playBgm();
      }
    }
  }

  public stopAllSounds() {
    this.cancelLetterTaps();
    for (const voices of this.soundPools.values()) {
      for (const voice of voices) {
        this.stopVoice(voice);
      }
    }
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
    // Prepare a bounded pool during startup, before the first drag. Several
    // voices let consecutive letters overlap without cutting each other off.
    this.prepareSoundPool('letter_tap', 6);
    this.prepareSoundPool('btn_1', 2);
    this.prepareSoundPool('btn_3', 2);
    this.prepareSoundPool('level_win', 1);
    // Auto-play BGM if music is enabled and not in game
    if (this.isMusicEnabled && !this.isInGame) {
      setTimeout(() => this.playBgm(), 500);
    }
  }

  // ===== BACKGROUND MUSIC =====
  public async playBgm() {
    if (!this.isAppActive || !this.isMusicEnabled || this.isInGame) return;
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
      this.cancelLetterTaps();
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
    if (this.isSoundEnabled === enabled) return;
    this.isSoundEnabled = enabled;
    if (!enabled) {
      this.cancelLetterTaps();
      for (const voices of this.soundPools.values()) {
        for (const voice of voices) this.stopVoice(voice);
      }
    }
  }

  public setMuted(muted: boolean) {
    this.setSoundEnabled(!muted);
  }

  private prepareSoundPool(sound: SoundEffect, count: number) {
    const voices: SoundVoice[] = [];
    this.soundPools.set(sound, voices);
    for (let i = 0; i < count; i++) {
      try {
        const player = createAudioPlayer(SOUND_ASSETS[sound], {
          keepAudioSessionActive: true,
        });
        const voice: SoundVoice = { player, ready: true, revision: 0, lastStarted: 0 };
        voices.push(voice);
        player.addListener('playbackStatusUpdate', (status) => {
          // Native events can arrive after this voice has already been reused.
          // Check the live native position, not the old event's playback state,
          // before pausing: otherwise a late finish can silence a new letter.
          if (status.didJustFinish && !voice.ready && !voice.rewind
            && !player.playing && player.duration > 0
            && player.currentTime >= player.duration - 0.005) {
            void this.rewindVoice(voice).catch((error) => {
              console.warn('Error preparing SFX replay:', error);
            });
          }
        });
      } catch (error) {
        console.warn('Error preparing SFX:', error);
      }
    }
  }

  private async rewindVoice(voice: SoundVoice): Promise<void> {
    if (voice.rewind) return voice.rewind;
    voice.ready = false;
    voice.player.pause();
    voice.rewind = voice.player.seekTo(0).then(() => {
      voice.ready = true;
    }).finally(() => {
      voice.rewind = undefined;
    });
    return voice.rewind;
  }

  private stopVoice(voice: SoundVoice) {
    // Invalidate a pending replay, including when sound is muted during a seek.
    voice.revision++;
    void this.rewindVoice(voice).catch((error) => {
      console.warn('Error stopping SFX:', error);
    });
  }

  private playSound(sound: SoundEffect, volume: number = 0.7) {
    if (!this.isAppActive || !this.isSoundEnabled) return;
    const voices = this.soundPools.get(sound);
    if (!voices?.length) return;
    const voice = voices.find((entry) => entry.ready && entry.player.isLoaded)
      ?? voices.reduce((oldest, entry) => entry.lastStarted < oldest.lastStarted ? entry : oldest);
    const revision = ++voice.revision;
    voice.lastStarted = ++this.soundSequence;
    const start = () => {
      if (!this.isAppActive || !this.isSoundEnabled || voice.revision !== revision) return;
      voice.ready = false;
      voice.player.volume = volume;
      voice.player.play();
    };
    try {
      if (voice.ready) {
        start();
      } else {
        // Reuse the oldest voice if a very fast swipe exhausts the pool.
        // Await the rewind so play() never starts at the end of the clip.
        void this.rewindVoice(voice).then(start).catch((error) => {
          console.warn('Error replaying SFX:', error);
        });
      }
    } catch (e) {
      console.warn('Error playing SFX:', e);
    }
  }

  public playLetterTap(step: number = 0) {
    this.playSound('letter_tap', 0.4);
  }

  // A fast swipe can cross several cells in one native touch event. Space
  // their clicks out so they remain audible instead of all starting together.
  public playLetterTaps(count: number) {
    if (!this.isAppActive || !this.isSoundEnabled || !Number.isFinite(count) || count < 1) return;
    // One grid line has at most eight cells; avoid a long backlog from jitter.
    this.pendingLetterTaps = Math.min(8, this.pendingLetterTaps + Math.floor(count));
    if (this.letterTapTimer === null) {
      const delay = Math.max(0, 40 - (Date.now() - this.lastLetterTapAt));
      if (delay === 0) this.drainLetterTaps();
      else this.letterTapTimer = setTimeout(() => this.drainLetterTaps(), delay);
    }
  }

  private drainLetterTaps() {
    this.letterTapTimer = null;
    if (!this.isAppActive || !this.isSoundEnabled || this.pendingLetterTaps === 0) return;
    this.pendingLetterTaps--;
    this.lastLetterTapAt = Date.now();
    this.playLetterTap();
    // Keep the cooldown even if the queue is empty: consecutive move events
    // in the same frame must not collapse into one simultaneous sound.
    this.letterTapTimer = setTimeout(() => this.drainLetterTaps(), 40);
  }

  public cancelLetterTaps() {
    if (this.letterTapTimer !== null) clearTimeout(this.letterTapTimer);
    this.letterTapTimer = null;
    this.pendingLetterTaps = 0;
    // A native seek may still be pending after its queue timer has fired.
    // Invalidate that replay too, without cutting off an already audible click.
    for (const voice of this.soundPools.get('letter_tap') ?? []) voice.revision++;
  }

  public playCoin() {
    this.playSound('btn_3', 0.6);
  }

  public playWordFound() {
    this.playSound('btn_1', 0.85);
  }

  public playVictory() {
    if (!this.isSoundEnabled) return;
    try {
      this.playSound('level_win', 0.9);
    } catch (e) {
      console.warn('Error playing victory sound:', e);
    }
  }

  public stopVictory() {
    for (const voice of this.soundPools.get('level_win') ?? []) this.stopVoice(voice);
  }

  public playSparkle() {
    this.playSound('btn_1', 0.5);
  }

  public playGameOver() {
    this.playSound('btn_3', 0.7);
  }

  public playTick() {
    this.playLetterTap(0);
  }

  public playChirp() {
    this.playLetterTap(1);
  }
}

export const nativeAudio = new NativeSoundEngine();
