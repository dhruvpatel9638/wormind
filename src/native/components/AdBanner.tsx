import React, { useState } from 'react';
import { LayoutChangeEvent, View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADMOB_CONFIG } from '../../config/admob';

interface AdBannerProps {
  style?: object;
  bottomInset?: number;
  onHeightChange?: (height: number) => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ style, bottomInset = 0, onHeightChange }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    onHeightChange?.(event.nativeEvent.layout.height);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }, style]} onLayout={handleLayout}>
      <BannerAd
        unitId={ADMOB_CONFIG.BANNER_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.warn('[AdMob Banner] Failed to load:', error);
          setHasError(true);
          onHeightChange?.(0);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'rgba(235, 244, 255, 0.95)',
    paddingVertical: 2,
    zIndex: 90,
  },
});
