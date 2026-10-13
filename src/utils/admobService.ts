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

// Tracking state for interstitial timing. Ads are never displayed in the
// middle of a level: a level completion is the only place that can consume a
// pending ad slot.
let lastInterstitialShownAt = Date.now();
let isInterstitialLoading = false;

// Keep a full two-minute gap between random interstitials. If this interval
// expires while the player is solving a level, the next completed level shows
// the pending ad instead of interrupting their game.
const INTERSTITIAL_GAP_MS = 3 * 60 * 1000;

// Show Google Interstitial Ad (Full Screen)
export const showInterstitialAd = (onClosed?: () => void, onShown?: () => void) => {
  const interstitial = InterstitialAd.createForAdRequest(ADMOB_CONFIG.INTERSTITIAL_ID, {
    requestNonPersonalizedAdsOnly: true,
  });

  let hasCleanedUp = false;
  const cleanup = () => {
    if (hasCleanedUp) return;
    hasCleanedUp = true;
    unsubscribeLoaded();
    unsubscribeClosed();
    unsubscribeError();
  };

  const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    onShown?.();
    interstitial.show();
  });

  const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    cleanup();
    if (onClosed) onClosed();
  });

  const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
    console.warn('[AdMob Interstitial] Error loading ad:', error);
    cleanup();
    if (onClosed) onClosed();
  });

  interstitial.load();
};

// Random interstitial trigger. This is deliberately called only after a level
// has been completed, so a due ad waits safely for that completion.
export const showSmartInterstitialAd = (onClosed?: () => void) => {
  const now = Date.now();
  const elapsed = now - lastInterstitialShownAt;

  if (isInterstitialLoading) {
    console.log('[AdMob Smart Interstitial] An interstitial is already loading.');
    onClosed?.();
    return;
  }

  if (elapsed < INTERSTITIAL_GAP_MS) {
    console.log(
      `[AdMob Smart Interstitial] Waiting for two-minute gap (${Math.ceil((INTERSTITIAL_GAP_MS - elapsed) / 1000)}s remaining).`
    );
    onClosed?.();
    return;
  }

  console.log('[AdMob Smart Interstitial] Two-minute gap reached; showing after level completion.');
  isInterstitialLoading = true;
  showInterstitialAd(
    () => {
      isInterstitialLoading = false;
      onClosed?.();
    },
    () => {
      lastInterstitialShownAt = Date.now();
    }
  );
};

// Reward callbacks run after the ad closes. Finished also runs for cancellation
// or failure so callers can release their loading/double-tap locks.
export const showRewardedAd = (
  onRewardGranted: () => void,
  onError?: () => void,
  onFinished?: () => void
) => {
  const subscriptions: Array<() => void> = [];
  let rewardEarned = false;
  let finished = false;
  let showing = false;

  const finish = (failed: boolean) => {
    if (finished) return;
    finished = true;
    for (const unsubscribe of subscriptions.splice(0)) unsubscribe();
    try {
      if (failed) onError?.();
      else if (rewardEarned) onRewardGranted();
    } finally {
      onFinished?.();
    }
  };

  const fail = (error: unknown) => {
    if (finished) return;
    console.warn('[AdMob Rewarded] Ad failed:', error);
    finish(true);
  };

  try {
    const rewarded = RewardedAd.createForAdRequest(ADMOB_CONFIG.REWARDED_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    subscriptions.push(
      rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
        if (finished || showing) return;
        showing = true;
        try {
          void Promise.resolve(rewarded.show()).catch(fail);
        } catch (error) {
          fail(error);
        }
      })
    );
    subscriptions.push(
      rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        if (!finished) rewardEarned = true;
      })
    );
    subscriptions.push(
      rewarded.addAdEventListener(AdEventType.CLOSED, () => finish(false))
    );
    subscriptions.push(
      rewarded.addAdEventListener(AdEventType.ERROR, fail)
    );

    void Promise.resolve(rewarded.load()).catch(fail);
  } catch (error) {
    fail(error);
  }
};
