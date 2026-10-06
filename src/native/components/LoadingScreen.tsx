import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { nativeAudio } from '../audio';

interface LoadingScreenProps {
  onFinish: () => void;
  minDuration?: number; // Total loading time in ms (default: 2800ms)
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BAR_WIDTH = Math.min(SCREEN_WIDTH * 0.76, 310);
const BAR_HEIGHT = 24;

const LOGO_WIDTH = Math.min(SCREEN_WIDTH * 0.60, 230);
const LOGO_HEIGHT = LOGO_WIDTH * (672 / 789);

export const NativeLoadingScreen: React.FC<LoadingScreenProps> = ({
  onFinish,
  minDuration = 2800,
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Animated values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const brainPulseAnim = useRef(new Animated.Value(1)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.6)).current;
  const logoFloatAnim = useRef(new Animated.Value(0)).current;
  const logoGlowAnim = useRef(new Animated.Value(0.5)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const textDotsAnim = useRef(new Animated.Value(0)).current;
  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const starsTwinkleAnim = useRef(new Animated.Value(0.4)).current;
  const [dotsCount, setDotsCount] = useState<number>(3);

  // 1. Brain Neon Pulse Loop
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(brainPulseAnim, {
          toValue: 1.25,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(brainPulseAnim, {
          toValue: 1.0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  // 1b. Logo Entrance Spring & Floating / Glow Pulse Loop
  useEffect(() => {
    // Spring pop-in entrance
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 45,
      useNativeDriver: true,
    }).start();

    // Floating bobbing loop
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoFloatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(logoFloatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();

    // Glow pulse loop
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(logoGlowAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoGlowAnim, {
          toValue: 0.45,
          duration: 1300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glowLoop.start();

    return () => {
      floatLoop.stop();
      glowLoop.stop();
    };
  }, []);

  // 2. Stars / Sparkles Twinkle Loop
  useEffect(() => {
    const twinkleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(starsTwinkleAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(starsTwinkleAnim, {
          toValue: 0.3,
          duration: 700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    twinkleLoop.start();
    return () => twinkleLoop.stop();
  }, []);

  // 3. Shimmer Sweep Animation on the Progress Bar
  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  // 4. Animated "Loading..." Dots Timer
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDotsCount((prev) => (prev % 3) + 1);
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);

  // 5. Main Progress Bar Sequence
  useEffect(() => {
    // Listen to progress for UI percentage
    const listenerId = progressAnim.addListener(({ value }) => {
      setProgressPercent(Math.round(value));
    });

    // Animate smoothly to 100% with game-like easing (fast start, brief suspense, quick finish)
    Animated.sequence([
      Animated.timing(progressAnim, {
        toValue: 35,
        duration: minDuration * 0.3,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: 75,
        duration: minDuration * 0.45,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
      Animated.timing(progressAnim, {
        toValue: 100,
        duration: minDuration * 0.25,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Play brief sound and fade out
      try {
        nativeAudio.playSparkle();
      } catch {}

      // Fade out and finish
      Animated.timing(fadeOutAnim, {
        toValue: 0,
        duration: 450,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    });

    return () => {
      progressAnim.removeListener(listenerId);
    };
  }, []);

  // Calculate filled width
  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, BAR_WIDTH - 6],
    extrapolate: 'clamp',
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-BAR_WIDTH, BAR_WIDTH],
  });

  const dotsString = '.'.repeat(dotsCount);

  // Generate 24 diagonal stripes to mimic the reference image
  const numStripes = 20;

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAnim }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* High-Resolution Clean Background matching the exact theme */}
      <ImageBackground
        source={require('../../../assets/images/loading_bg.png')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        {/* Pulsing Neon Cyan Aura centered over the Brain Icon */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.brainAura,
            {
              transform: [{ scale: brainPulseAnim }],
              opacity: brainPulseAnim.interpolate({
                inputRange: [1.0, 1.25],
                outputRange: [0.35, 0.75],
              }),
            },
          ]}
        />

        {/* Animated WORMIND Crest Logo Placed Right Below the Mind */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: logoScaleAnim },
                {
                  translateY: logoFloatAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Pulsing Neon Cyan Glow Halo behind Logo */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.logoGlowBackdrop,
              {
                opacity: logoGlowAnim,
                transform: [
                  {
                    scale: logoGlowAnim.interpolate({
                      inputRange: [0.45, 1],
                      outputRange: [0.95, 1.12],
                    }),
                  },
                ],
              },
            ]}
          />

          <Image
            source={require('../../../assets/images/wormind_logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Ambient Twinkling Floating Sparkles */}
        <Animated.View
          pointerEvents="none"
          style={[styles.sparkle1, { opacity: starsTwinkleAnim }]}
        >
          <MaterialIcons name="star" size={14} color="#00F0FF" />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.sparkle2, { opacity: starsTwinkleAnim }]}
        >
          <MaterialIcons name="auto-awesome" size={16} color="#38BDF8" />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.sparkle3, { opacity: starsTwinkleAnim }]}
        >
          <MaterialIcons name="star" size={12} color="#C084FC" />
        </Animated.View>

        {/* Active Animated Progress Section (Positioned precisely over the loading area) */}
        <View style={styles.loadingControlContainer}>
          {/* Glowing "Loading..." Title */}
          <View style={styles.loadingTitleRow}>
            <Text style={styles.loadingTitle}>
              Loading{dotsString}
            </Text>
          </View>

          {/* Futuristic Neon Capsule Progress Bar */}
          <View style={styles.barOuterWrapper}>
            {/* Sparkle Left */}
            <Animated.View style={[styles.barSparkleLeft, { opacity: starsTwinkleAnim }]}>
              <MaterialIcons name="auto-awesome" size={16} color="#00F0FF" />
            </Animated.View>

            {/* Neon Bar Track */}
            <View style={styles.barTrack}>
              {/* Inner Track Glow Shadow */}
              <View style={styles.innerTrackBg} />

              {/* Animated Progress Fill */}
              <Animated.View style={[styles.barFillContainer, { width: fillWidth }]}>
                <LinearGradient
                  colors={['#00F0FF', '#00B4D8', '#6366F1', '#A855F7', '#EC4899', '#F43F5E']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.gradientFill}
                >
                  {/* Segmented Diagonal Slices Overlay matching reference */}
                  <View style={styles.stripesContainer}>
                    {Array.from({ length: numStripes }).map((_, idx) => (
                      <View key={`stripe-${idx}`} style={styles.diagonalStripe} />
                    ))}
                  </View>

                  {/* Bright Shimmer Wave Sweep */}
                  <Animated.View
                    style={[
                      styles.shimmerSweep,
                      {
                        transform: [{ translateX: shimmerTranslateX }],
                      },
                    ]}
                  />
                </LinearGradient>
              </Animated.View>
            </View>

            {/* Sparkle Right */}
            <Animated.View style={[styles.barSparkleRight, { opacity: starsTwinkleAnim }]}>
              <MaterialIcons name="auto-awesome" size={16} color="#C084FC" />
            </Animated.View>
          </View>

          {/* Progress Percentage */}
          <View style={styles.statusRow}>
            <Text style={styles.percentText}>{progressPercent}%</Text>
          </View>
        </View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: '#16022B',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Pulsing neon halo over the brain
  brainAura: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.135,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(0, 240, 255, 0.28)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 30,
    elevation: 15,
  },
  // Animated Logo below the brain
  logoContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.245,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  logoGlowBackdrop: {
    position: 'absolute',
    width: LOGO_WIDTH * 0.88,
    height: LOGO_HEIGHT * 0.88,
    borderRadius: (LOGO_WIDTH * 0.88) / 2,
    backgroundColor: 'rgba(0, 240, 255, 0.22)',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 28,
    elevation: 20,
  },
  logoImage: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  // Twinkling ambient sparkles
  sparkle1: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.22,
    right: SCREEN_WIDTH * 0.18,
  },
  sparkle2: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.58,
    left: SCREEN_WIDTH * 0.12,
  },
  sparkle3: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.59,
    right: SCREEN_WIDTH * 0.14,
  },
  // Loading section centered at ~66% of screen height
  loadingControlContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.635,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  loadingTitleRow: {
    marginBottom: 10,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 240, 255, 0.85)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  barOuterWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  barSparkleLeft: {
    marginRight: 6,
  },
  barSparkleRight: {
    marginLeft: 6,
  },
  barTrack: {
    width: BAR_WIDTH,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: '#0F0328',
    borderWidth: 2.5,
    borderColor: '#00E5FF',
    padding: 2,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#00F0FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 14,
    elevation: 12,
  },
  innerTrackBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0D0221',
    borderRadius: BAR_HEIGHT / 2,
  },
  barFillContainer: {
    height: '100%',
    borderRadius: (BAR_HEIGHT - 6) / 2,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    height: '100%',
    borderRadius: (BAR_HEIGHT - 6) / 2,
    position: 'relative',
    overflow: 'hidden',
  },
  stripesContainer: {
    ...StyleSheet.absoluteFill,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  diagonalStripe: {
    width: 3.5,
    height: '140%',
    backgroundColor: 'rgba(15, 3, 40, 0.65)',
    transform: [{ skewX: '-28deg' }],
  },
  shimmerSweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    transform: [{ skewX: '-25deg' }],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: BAR_WIDTH,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00F0FF',
    textShadowColor: 'rgba(0, 240, 255, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
