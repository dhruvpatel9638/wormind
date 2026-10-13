import { TestIds as GoogleTestIds } from 'react-native-google-mobile-ads';

export const TestIds = {
  BANNER: GoogleTestIds.BANNER,
  INTERSTITIAL: GoogleTestIds.INTERSTITIAL,
  REWARDED_INTERSTITIAL: GoogleTestIds.REWARDED_INTERSTITIAL,
};

export const ADMOB_CONFIG = {
  // Set to true to use Google's official test ad units in development
  IS_TEST_MODE: false,

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
