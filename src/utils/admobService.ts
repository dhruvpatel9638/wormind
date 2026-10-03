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
