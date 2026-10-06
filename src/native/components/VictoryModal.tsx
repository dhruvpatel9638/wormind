import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { PartyConfetti } from './PartyConfetti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface VictoryModalProps {
  visible: boolean;
  levelId: number;
  maxWordStreak: number;
  coinsEarned?: number;
  strikeEarned?: number;
  xpEarned?: number;
  onNextLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  levelId,
  maxWordStreak,
  coinsEarned = 50,
  strikeEarned = 10,
  xpEarned = 100,
  onNextLevel,
}) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const sunburstRotate = useRef(new Animated.Value(0)).current;
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;
  const rewardsFade = useRef(new Animated.Value(0)).current;

  // Continuous rotating sunburst halo
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sunburstRotate, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sunburstRotate]);

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      rewardsFade.setValue(0);

      Animated.sequence([
        // Card pop in with energetic spring
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 5,
          tension: 48,
          useNativeDriver: true,
        }),
        // Staggered star pops
        Animated.stagger(120, [
          Animated.spring(star1Scale, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
          Animated.spring(star2Scale, { toValue: 1, friction: 3.5, tension: 70, useNativeDriver: true }),
          Animated.spring(star3Scale, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
        ]),
        // Rewards fade & slide up
        Animated.timing(rewardsFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      cardScale.setValue(0);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      rewardsFade.setValue(0);
    }
  }, [visible]);

  const haloSpin = sunburstRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        {/* Confetti & Streamer Ribbons ("Zario") Celebration */}
        <PartyConfetti active={visible} />

        {/* Central Victory Card */}
        <Animated.View style={[styles.cardContainer, { transform: [{ scale: cardScale }] }]}>
          
          {/* Top Winged Crest with Sunburst Aura */}
          <View style={styles.crestWrapper}>
            {/* Rotating Golden Sunburst Halo */}
            <Animated.View style={[styles.sunburstHalo, { transform: [{ rotate: haloSpin }] }]}>
              {[0, 30, 60, 90, 120, 150].map((deg) => (
                <View
                  key={deg}
                  style={[
                    styles.sunburstRay,
                    { transform: [{ rotate: `${deg}deg` }] },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Floating Stars above the emblem */}
            <View style={styles.floatingStarsRow}>
              <Animated.View style={{ transform: [{ scale: star1Scale }, { translateY: 6 }] }}>
                <MaterialIcons name="star" size={28} color="#FFD700" style={styles.starShadow} />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: star2Scale }, { translateY: -4 }] }}>
                <MaterialIcons name="star" size={40} color="#FFFBEB" style={styles.starShadow} />
              </Animated.View>
              <Animated.View style={{ transform: [{ scale: star3Scale }, { translateY: 6 }] }}>
                <MaterialIcons name="star" size={28} color="#FFD700" style={styles.starShadow} />
              </Animated.View>
            </View>

            {/* Winged Emblem: Left Wings + Center Trophy Crest + Right Wings */}
            <View style={styles.wingsEmblemRow}>
              {/* Left Wing (3 layered sculpted feathers) */}
              <View style={styles.wingLeft}>
                <View style={[styles.wingFeather, styles.wingFeatherTopLeft]} />
                <View style={[styles.wingFeather, styles.wingFeatherMidLeft]} />
                <View style={[styles.wingFeather, styles.wingFeatherBotLeft]} />
              </View>

              {/* Center Royal Trophy Crest */}
              <View style={styles.centerShield}>
                <LinearGradient
                  colors={['#FFD700', '#F59E0B', '#D97706']}
                  style={styles.shieldGradientRing}
                >
                  <View style={styles.shieldInner}>
                    <MaterialIcons name="emoji-events" size={44} color="#FFD700" />
                  </View>
                </LinearGradient>
              </View>

              {/* Right Wing (3 layered sculpted feathers) */}
              <View style={styles.wingRight}>
                <View style={[styles.wingFeather, styles.wingFeatherTopRight]} />
                <View style={[styles.wingFeather, styles.wingFeatherMidRight]} />
                <View style={[styles.wingFeather, styles.wingFeatherBotRight]} />
              </View>
            </View>
          </View>

          {/* Victory Ribbon Banner (Violet + Gold 3D Banner) */}
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={['#8B5CF6', '#6D28D9', '#4C1D95']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerGradient}
            >
              <View style={styles.bannerInnerBorder}>
                <Text style={styles.victoryBannerText}>VICTORY</Text>
              </View>
            </LinearGradient>
            <View style={styles.bannerShadowBottom} />
          </View>

          {/* Level Subtitle Pill */}
          <View style={styles.subtitlePill}>
            <Text style={styles.subtitlePillText}>LEVEL {levelId} COMPLETED!</Text>
          </View>

          {/* Optional Streak Badge if streak earned */}
          {maxWordStreak > 0 && (
            <View style={styles.streakBadge}>
              <MaterialIcons name="local-fire-department" size={16} color="#FF4500" />
              <Text style={styles.streakBadgeText}>BEST STREAK: {maxWordStreak}x</Text>
            </View>
          )}

          {/* Rewards Container */}
          <Animated.View style={[styles.rewardsContainer, { opacity: rewardsFade }]}>
            <View style={styles.rewardsHeaderRow}>
              <View style={styles.headerLine} />
              <Text style={styles.rewardsHeaderTitle}>✦ REWARDS ✦</Text>
              <View style={styles.headerLine} />
            </View>

            {/* 3 Prominent Reward Boxes in Game Color Scheme */}
            <View style={styles.rewardCardsRow}>
              {/* Primary Coins Reward Card */}
              <View style={[styles.rewardCard, styles.coinsCard]}>
                <View style={styles.rewardIconCircleGold}>
                  <MaterialIcons name="monetization-on" size={26} color="#FFD700" />
                </View>
                <Text style={styles.rewardAmountGold}>+{coinsEarned}</Text>
                <Text style={styles.rewardNameGold}>Coins</Text>
              </View>

              {/* Snapchat Strike Reward Card */}
              <View style={[styles.rewardCard, styles.strikeCard]}>
                <View style={styles.rewardIconCircleOrange}>
                  <MaterialIcons name="local-fire-department" size={26} color="#FF4500" />
                </View>
                <Text style={styles.rewardAmountOrange}>+{strikeEarned}</Text>
                <Text style={styles.rewardNameOrange}>Strike 🔥</Text>
              </View>

              {/* XP Reward Card */}
              <View style={[styles.rewardCard, styles.xpCard]}>
                <View style={styles.rewardIconCircleViolet}>
                  <MaterialIcons name="military-tech" size={26} color="#A855F7" />
                </View>
                <Text style={styles.rewardAmountViolet}>+{xpEarned}</Text>
                <Text style={styles.rewardNameViolet}>XP</Text>
              </View>
            </View>
          </Animated.View>

          {/* 3D Action Button: NEXT LEVEL */}
          <Pressable
            onPress={onNextLevel}
            style={({ pressed }) => [styles.nextBtnWrapper, pressed && styles.pressedBtn]}
          >
            <LinearGradient
              colors={['#FFD700', '#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.nextBtnGradient}
            >
              <Text style={styles.nextBtnText}>NEXT LEVEL</Text>
              <MaterialIcons name="arrow-forward" size={22} color="#451A03" />
            </LinearGradient>
            <View style={styles.nextBtnBevel} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 3, 24, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: Math.min(SCREEN_WIDTH - 40, 340),
    backgroundColor: '#1E0B40', // Loki Deep Violet
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#7C3AED',
    alignItems: 'center',
    paddingTop: 54,
    paddingBottom: 24,
    paddingHorizontal: 20,
    elevation: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    marginTop: 40,
  },

  /* Crest & Wings Header */
  crestWrapper: {
    position: 'absolute',
    top: -62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstHalo: {
    position: 'absolute',
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstRay: {
    position: 'absolute',
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 215, 0, 0.16)',
  },
  floatingStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: -4,
    zIndex: 10,
  },
  starShadow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  wingsEmblemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  centerShield: {
    zIndex: 6,
  },
  shieldGradientRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    padding: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  shieldInner: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
    backgroundColor: '#2E1065',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },

  /* Wing Feathers */
  wingLeft: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: -10,
  },
  wingRight: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginLeft: -10,
  },
  wingFeather: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  wingFeatherTopLeft: {
    width: 38,
    height: 13,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 2,
    transform: [{ rotate: '18deg' }, { translateY: -2 }],
  },
  wingFeatherMidLeft: {
    width: 44,
    height: 13,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 6,
    borderTopRightRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '6deg' }],
  },
  wingFeatherBotLeft: {
    width: 32,
    height: 11,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '-8deg' }, { translateY: 2 }],
  },

  wingFeatherTopRight: {
    width: 38,
    height: 13,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 2,
    transform: [{ rotate: '-18deg' }, { translateY: -2 }],
  },
  wingFeatherMidRight: {
    width: 44,
    height: 13,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 6,
    borderTopLeftRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '-6deg' }],
  },
  wingFeatherBotRight: {
    width: 32,
    height: 11,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 2,
    marginTop: 2,
    transform: [{ rotate: '8deg' }, { translateY: 2 }],
  },

  /* 3D VICTORY Ribbon Banner */
  bannerContainer: {
    width: '92%',
    marginTop: 18,
    position: 'relative',
    alignItems: 'center',
  },
  bannerGradient: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#C4B5FD',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  bannerInnerBorder: {
    paddingHorizontal: 12,
  },
  victoryBannerText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bannerShadowBottom: {
    position: 'absolute',
    bottom: -4,
    width: '94%',
    height: 6,
    backgroundColor: '#3B0764',
    borderRadius: 10,
    zIndex: -1,
  },

  subtitlePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196, 181, 253, 0.35)',
    marginTop: 10,
  },
  subtitlePillText: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 69, 0, 0.18)',
    borderWidth: 1.5,
    borderColor: '#FF4500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 8,
  },
  streakBadgeText: {
    color: '#FF6B00',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Rewards Card Section */
  rewardsContainer: {
    width: '100%',
    backgroundColor: '#2A1054',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#4C1D95',
    padding: 14,
    marginTop: 16,
    marginBottom: 20,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(221, 214, 254, 0.25)',
  },
  rewardsHeaderTitle: {
    color: '#DDD6FE',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginHorizontal: 10,
  },
  rewardCardsRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  rewardCard: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  coinsCard: {
    backgroundColor: '#35185E',
    borderColor: '#F59E0B',
  },
  strikeCard: {
    backgroundColor: '#3D144A',
    borderColor: '#FF5722',
  },
  xpCard: {
    backgroundColor: '#31145C',
    borderColor: '#8B5CF6',
  },
  rewardIconCircleGold: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rewardIconCircleOrange: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 87, 34, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rewardIconCircleViolet: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rewardAmountGold: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '900',
  },
  rewardNameGold: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  rewardAmountOrange: {
    color: '#FF7A45',
    fontSize: 15,
    fontWeight: '900',
  },
  rewardNameOrange: {
    color: '#FFC7B0',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  rewardAmountViolet: {
    color: '#C4B5FD',
    fontSize: 15,
    fontWeight: '900',
  },
  rewardNameViolet: {
    color: '#E9D5FF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },

  /* 3D Action Button */
  nextBtnWrapper: {
    width: '100%',
    position: 'relative',
  },
  nextBtnGradient: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 6,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  nextBtnText: {
    color: '#451A03', // Deep rich amber brown for extreme contrast on gold
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  nextBtnBevel: {
    position: 'absolute',
    bottom: -3,
    left: '4%',
    width: '92%',
    height: 6,
    backgroundColor: '#B45309',
    borderRadius: 12,
    zIndex: -1,
  },
  pressedBtn: {
    transform: [{ scale: 0.97 }],
  },
});
