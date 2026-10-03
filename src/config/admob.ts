import { TestIds as GoogleTestIds } from 'react-native-google-mobile-ads';

export const TestIds = {
  BANNER: GoogleTestIds.BANNER,
  INTERSTITIAL: GoogleTestIds.INTERSTITIAL,
  REWARDED: GoogleTestIds.REWARDED,
};

export const ADMOB_CONFIG = {
  // Set to true to use Google's official test ad units in development
  IS_TEST_MODE: true,

  // Production Ad Unit IDs from Google AdMob Console
  PROD_BANNER_ID: 'ca-app-pub-3715204237561132/6756110417',
  PROD_INTERSTITIAL_ID: 'ca-app-pub-3715204237561132/6564538722',
  PROD_REWARDED_ID: 'ca-app-pub-3715204237561132/8760466387',

  get BANNER_ID() {
    return this.IS_TEST_MODE ? TestIds.BANNER : this.PROD_BANNER_ID;
  },
  get INTERSTITIAL_ID() {
    return this.IS_TEST_MODE ? TestIds.INTERSTITIAL : this.PROD_INTERSTITIAL_ID;
  },
  get REWARDED_ID() {
    return this.IS_TEST_MODE ? TestIds.REWARDED : this.PROD_REWARDED_ID;
  },
};
