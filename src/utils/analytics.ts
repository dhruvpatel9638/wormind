import { getAnalytics, logEvent, logAppOpen as fbLogAppOpen, logLevelStart as fbLogLevelStart, logLevelEnd, logSpendVirtualCurrency, logEarnVirtualCurrency } from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

// ════════════════════════════════════════════════════════
//  WORMIND — Firebase Analytics Events
//  Usage: import { logLevelStart } from './analytics';
// ════════════════════════════════════════════════════════

const getA = () => getAnalytics(getApp());

/** App open / session start */
export const logAppOpen = () => {
  try { fbLogAppOpen(getA()); } catch {}
};

/** Level start — called when GameView mounts */
export const logLevelStart = (levelId: number) => {
  try { fbLogLevelStart(getA(), { level: levelId }); } catch {}
};

/** Level complete — called after victory animation */
export const logLevelComplete = (levelId: number, stars: number, coinsEarned: number) => {
  try {
    logEvent(getA(), 'level_complete', {
      level_id: levelId,
      stars,
      coins_earned: coinsEarned,
    });
  } catch {}
};

/** Level fail — time out / game over */
export const logLevelFail = (levelId: number) => {
  try {
    logLevelEnd(getA(), { level: levelId, success: false });
  } catch {}
};

/** Word found by swiping */
export const logWordFound = (word: string, levelId: number) => {
  try {
    logEvent(getA(), 'word_found', {
      word: word.toUpperCase(),
      level_id: levelId,
    });
  } catch {}
};

/** Coin-funded hint used */
export const logHintUsed = (levelId: number) => {
  try {
    logEvent(getA(), 'hint_used', { level_id: levelId, hint_type: 'coin' });
  } catch {}
};

/** Rewarded-ad hint used */
export const logAdHintUsed = (levelId: number) => {
  try {
    logEvent(getA(), 'hint_used', { level_id: levelId, hint_type: 'rewarded_ad' });
  } catch {}
};

/** Reveal word used (coin-funded) */
export const logRevealUsed = (word: string, levelId: number) => {
  try {
    logEvent(getA(), 'reveal_used', { word: word.toUpperCase(), level_id: levelId });
  } catch {}
};

/** Coin spend */
export const logCoinSpend = (amount: number, reason: string) => {
  try {
    logSpendVirtualCurrency(getA(), {
      item_name: reason,
      virtual_currency_name: 'coins',
      value: amount,
    });
  } catch {}
};

/** Coin earned */
export const logCoinEarned = (amount: number, source: string) => {
  try {
    logEarnVirtualCurrency(getA(), {
      virtual_currency_name: 'coins',
      value: amount,
    });
  } catch {}
};

/** Ad shown */
export const logAdShown = (adType: 'interstitial' | 'rewarded' | 'banner') => {
  try {
    logEvent(getA(), 'ad_shown', { ad_type: adType });
  } catch {}
};

/** Rewarded ad — reward granted */
export const logAdRewardClaimed = (levelId: number) => {
  try {
    logEvent(getA(), 'ad_reward_claimed', { level_id: levelId });
  } catch {}
};

/** Lucky Wheel spun */
export const logWheelSpin = (prize: string) => {
  try {
    logEvent(getA(), 'wheel_spin', { prize_type: prize });
  } catch {}
};

/** Daily reward claimed */
export const logDailyRewardClaimed = (day: number, coins: number) => {
  try {
    logEvent(getA(), 'daily_reward_claimed', { day, coins });
  } catch {}
};

/** Strike restored via ad */
export const logStrikeRestored = (method: 'rewarded_ad' | 'free') => {
  try {
    logEvent(getA(), 'strike_restored', { method });
  } catch {}
};

/** Level selected from World map */
export const logLevelSelected = (levelId: number, chapter: 'sunny' | 'ocean' | 'endless') => {
  try {
    logEvent(getA(), 'level_selected', { level_id: levelId, chapter });
  } catch {}
};

/** Milestone chest claimed */
export const logChestClaimed = (levelId: number, coins: number) => {
  try {
    logEvent(getA(), 'chest_claimed', { level_id: levelId, coins_earned: coins });
  } catch {}
};

/** Settings toggle */
export const logSettingToggle = (setting: 'sound' | 'music' | 'haptics', enabled: boolean) => {
  try {
    logEvent(getA(), 'setting_toggle', { setting, enabled });
  } catch {}
};

/** Word streak milestone (3x, 5x, 10x) */
export const logWordStreak = (streak: number, levelId: number) => {
  if (streak === 3 || streak === 5 || streak === 10) {
    try {
      logEvent(getA(), 'word_streak_milestone', { streak, level_id: levelId });
    } catch {}
  }
};
