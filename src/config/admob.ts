import { TurboModuleRegistry } from 'react-native';

type GoogleMobileAdsModule = typeof import('react-native-google-mobile-ads');

let cachedModule: GoogleMobileAdsModule | null | undefined;

/**
 * Lazily loads `react-native-google-mobile-ads` only when its native TurboModule
 * is linked in the binary (returns `null` in Expo Go).
 */
export const getGoogleMobileAds = (): GoogleMobileAdsModule | null => {
  if (cachedModule !== undefined) return cachedModule;
  try {
    if (TurboModuleRegistry.get('RNGoogleMobileAdsModule')) {
      cachedModule = require('react-native-google-mobile-ads') as GoogleMobileAdsModule;
      return cachedModule;
    }
  } catch {
    // Unavailable when running without the native AdMob module (e.g. Expo Go).
  }
  cachedModule = null;
  return null;
};

export const TestIds = {
  get BANNER() {
    return getGoogleMobileAds()?.TestIds.BANNER ?? '';
  },
  get INTERSTITIAL() {
    return getGoogleMobileAds()?.TestIds.INTERSTITIAL ?? '';
  },
  get REWARDED_INTERSTITIAL() {
    return getGoogleMobileAds()?.TestIds.REWARDED_INTERSTITIAL ?? '';
  },
};

export const ADMOB_CONFIG = {
  // Set to true to use Google's official test ad units in development
  IS_TEST_MODE: true,

  // Production Ad Unit IDs from Google AdMob Console
  PROD_BANNER_ID: 'ca-app-pub-4708904475412828/2763273944',
  PROD_INTERSTITIAL_ID: 'ca-app-pub-4708904475412828/1929624294',
  // This ID is a Rewarded interstitial unit in AdMob, not a standard Rewarded unit.
  PROD_REWARDED_INTERSTITIAL_ID: 'ca-app-pub-4708904475412828/6127803882',

  get BANNER_ID() {
    return this.IS_TEST_MODE ? TestIds.BANNER : this.PROD_BANNER_ID;
  },
  get INTERSTITIAL_ID() {
    return this.IS_TEST_MODE ? TestIds.INTERSTITIAL : this.PROD_INTERSTITIAL_ID;
  },
  get REWARDED_INTERSTITIAL_ID() {
    return this.IS_TEST_MODE
      ? TestIds.REWARDED_INTERSTITIAL
      : this.PROD_REWARDED_INTERSTITIAL_ID;
  },
};
