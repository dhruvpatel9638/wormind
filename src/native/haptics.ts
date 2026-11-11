import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class NativeHapticsEngine {
  private enabled: boolean = true;
  private lastLightAt: number = 0;

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Ultra-light subtle tactile tick for letter swipes, grid dragging, and UI buttons.
   * Throttled by ~35ms so ultra-fast drags don't turn into a buzzing drone.
   */
  public light() {
    if (!this.enabled) return;
    const now = Date.now();
    if (now - this.lastLightAt < 35) return;
    this.lastLightAt = now;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate(8);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate(8);
      }
    }
  }

  /**
   * Crisp selection tick (used for single letter tap, tab switch, toggle press)
   */
  public selection() {
    if (!this.enabled) return;
    try {
      Haptics.selectionAsync().catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate(10);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate(10);
      }
    }
  }

  /**
   * Medium impact (used for Hints, Reveals, Power-ups, Chest opens)
   */
  public medium() {
    if (!this.enabled) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate(20);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate(20);
      }
    }
  }

  /**
   * Success notification (used when a valid word is found, daily reward claimed, level win)
   */
  public success() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 15, 60, 25]);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 15, 60, 25]);
      }
    }
  }

  /**
   * Warning notification (used for invalid word selection, wrong guess, life deduction)
   */
  public warning() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 20, 40, 20]);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 20, 40, 20]);
      }
    }
  }

  /**
   * Error notification (used for time out / level fail / out of lives)
   */
  public error() {
    if (!this.enabled) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {
        if (Platform.OS === 'android') {
          Vibration.vibrate([0, 30, 60, 40]);
        }
      });
    } catch {
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 30, 60, 40]);
      }
    }
  }
}

export const nativeHaptics = new NativeHapticsEngine();
