import MobileAds, {
  InterstitialAd,
  RewardedAd,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../config/admob';

// Initialize Google Mobile Ads SDK
export const initAdMob = async () => {
  try {
    await MobileAds().initialize();
    console.log('[AdMob] Google Mobile Ads SDK initialized successfully');
  } catch (error) {
    console.warn('[AdMob] SDK initialization failed:', error);
  }
};

// Tracking state for Interstitial Ad Frequency & Time Capping
let lastAdTimestamp = 0;
let levelsCompletedSinceLastAd = 0;

// Smart Ad Parameters
const MIN_AD_INTERVAL_MS = 45 * 1000;     // 45 seconds min cooldown
const MAX_AD_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes max interval (forced trigger)
const MIN_LEVELS_BETWEEN_ADS = 2;         // At least 2 levels completed
const RANDOM_SHOW_PROBABILITY = 0.5;      // 50% random chance

// Show Google Interstitial Ad (Full Screen)
export const showInterstitialAd = (onClosed?: () => void) => {
  const interstitial = InterstitialAd.createForAdRequest(ADMOB_CONFIG.INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    interstitial.show();
  });

  const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeLoaded();
    unsubscribeClosed();
    if (onClosed) onClosed();
  });

  const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.warn('[AdMob Interstitial] Error loading ad:', error);
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
    if (onClosed) onClosed();
  });

  interstitial.load();
};

// Smart Interstitial Ad Trigger (Randomized on win + Auto-run after 3 mins)
export const showSmartInterstitialAd = (onClosed?: () => void) => {
  const now = Date.now();
  levelsCompletedSinceLastAd++;

  const timeElapsed = now - lastAdTimestamp;
  const isTimeForceTrigger = lastAdTimestamp > 0 && timeElapsed >= MAX_AD_INTERVAL_MS;
  const isCooldownActive = lastAdTimestamp > 0 && timeElapsed < MIN_AD_INTERVAL_MS;

  // 1. Force show if 3+ minutes passed since last ad
  if (isTimeForceTrigger) {
    console.log(
      `[AdMob Smart Interstitial] ⏰ Forced ad display! Elapsed: ${Math.round(timeElapsed / 1000)}s >= 180s`
    );
    displayAndTrackAd(onClosed);
    return;
  }

  // 2. Skip if ad was shown less than 45 seconds ago
  if (isCooldownActive) {
    console.log(
      `[AdMob Smart Interstitial] ⏳ Skipped ad (Cooldown: ${Math.round(timeElapsed / 1000)}s < 45s)`
    );
    if (onClosed) onClosed();
    return;
  }

  // 3. Skip if fewer than 2 levels completed since last ad
  if (levelsCompletedSinceLastAd < MIN_LEVELS_BETWEEN_ADS) {
    console.log(
      `[AdMob Smart Interstitial] 🎮 Skipped ad (${levelsCompletedSinceLastAd}/${MIN_LEVELS_BETWEEN_ADS} levels completed)`
    );
    if (onClosed) onClosed();
    return;
  }

  // 4. Random 50% chance trigger on level win
  if (Math.random() < RANDOM_SHOW_PROBABILITY) {
    console.log('[AdMob Smart Interstitial] 🎲 Randomized ad trigger hit! Showing ad...');
    displayAndTrackAd(onClosed);
  } else {
    console.log('[AdMob Smart Interstitial] 🎲 Random check missed. Skipping ad.');
    if (onClosed) onClosed();
  }
};

const displayAndTrackAd = (onClosed?: () => void) => {
  lastAdTimestamp = Date.now();
  levelsCompletedSinceLastAd = 0;
  showInterstitialAd(onClosed);
};

// Show Google Rewarded Video Ad (Free Hint)
export const showRewardedAd = (onRewardGranted: () => void, onError?: () => void) => {
  const rewarded = RewardedAd.createForAdRequest(ADMOB_CONFIG.REWARDED_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  let rewardEarned = false;

  const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
    rewarded.show();
  });

  const unsubscribeEarned = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    (reward) => {
      console.log('[AdMob Rewarded] User earned reward:', reward);
      rewardEarned = true;
    }
  );

  const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeClosed();
    if (rewardEarned) {
      onRewardGranted();
    }
  });

  const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
    console.warn('[AdMob Rewarded] Error loading ad:', error);
    unsubscribeLoaded();
    unsubscribeEarned();
    unsubscribeClosed();
    unsubscribeError();
    if (onError) onError();
  });

  rewarded.load();
};
