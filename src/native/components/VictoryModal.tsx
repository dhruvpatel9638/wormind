import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgGradient,
  RadialGradient as SvgRadial,
  Stop,
  Ellipse,
  Polygon,
  Rect,
  Circle,
} from 'react-native-svg';
import { PartyConfetti } from './PartyConfetti';
import { WoodenPopupCard, Game3DButton } from './WorMindPopups';

// ══════════════════════════════════════════════════════════════════════════════
// 3D GOLDEN VICTORY TROPHY & 3 BOUNCING STARS CENTERPIECE
// ══════════════════════════════════════════════════════════════════════════════
interface VictoryTrophyProps {
  size?: number;
  star1Scale: Animated.Value;
  star2Scale: Animated.Value;
  star3Scale: Animated.Value;
}

const VictoryTrophyVector: React.FC<VictoryTrophyProps> = ({
  size = 140,
  star1Scale,
  star2Scale,
  star3Scale,
}) => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.trophyWrapper, { width: size, height: size * 0.85 }]}>
      {/* Rotating Golden Sunburst Halo */}
      <Animated.View style={[styles.trophySunburst, { transform: [{ rotate: spin }] }]}>
        <Svg width={size * 1.35} height={size * 1.35} viewBox="0 0 160 160">
          <Defs>
            <SvgRadial id="trophySunburstGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FDE047" stopOpacity="0.45" />
              <Stop offset="65%" stopColor="#F59E0B" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
            </SvgRadial>
          </Defs>
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <Path
              key={deg}
              d="M 80 80 L 72 0 L 88 0 Z"
              fill="url(#trophySunburstGrad)"
              transform={`rotate(${deg} 80 80)`}
            />
          ))}
        </Svg>
      </Animated.View>

      {/* Floating 4-Point Golden Sparkle Stars */}
      <View style={styles.trophySparkles} pointerEvents="none">
        <Svg width={size} height={size * 0.85} viewBox="0 0 140 120">
          {/* Top-Left Sparkle */}
          <Path d="M 22 18 Q 22 25 15 25 Q 22 25 22 32 Q 22 25 29 25 Q 22 25 22 18 Z" fill="#FDE047" />
          {/* Mid-Left Sparkle */}
          <Path d="M 12 52 Q 12 57 7 57 Q 12 57 12 62 Q 12 57 17 57 Q 12 57 12 52 Z" fill="#FEF08A" />
          {/* Top-Right Sparkle */}
          <Path d="M 118 20 Q 118 27 111 27 Q 118 27 118 34 Q 118 27 125 27 Q 118 27 118 20 Z" fill="#FDE047" />
          {/* Mid-Right Sparkle */}
          <Path d="M 128 54 Q 128 59 123 59 Q 128 59 128 64 Q 128 59 133 59 Q 128 59 128 54 Z" fill="#FEF08A" />
        </Svg>
      </View>

      {/* Floating 3 Stars popping above the trophy */}
      <View style={styles.trophyStarsRow}>
        <Animated.View style={{ transform: [{ scale: star1Scale }, { translateY: 4 }, { rotate: '-12deg' }] }}>
          <MaterialIcons name="star" size={26} color="#FFD700" style={styles.starGlow} />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: star2Scale }, { translateY: -6 }] }}>
          <MaterialIcons name="star" size={38} color="#FFFBEB" style={styles.starGlow} />
        </Animated.View>
        <Animated.View style={{ transform: [{ scale: star3Scale }, { translateY: 4 }, { rotate: '12deg' }] }}>
          <MaterialIcons name="star" size={26} color="#FFD700" style={styles.starGlow} />
        </Animated.View>
      </View>

      {/* 3D Golden Trophy Cup SVG */}
      <Svg width={size * 0.75} height={size * 0.65} viewBox="0 0 100 86">
        <Defs>
          <SvgGradient id="goldCupGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#FFFBEB" />
            <Stop offset="25%" stopColor="#FDE047" />
            <Stop offset="65%" stopColor="#F59E0B" />
            <Stop offset="100%" stopColor="#B45309" />
          </SvgGradient>
          <SvgGradient id="cupStemGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#F59E0B" />
            <Stop offset="50%" stopColor="#D97706" />
            <Stop offset="100%" stopColor="#78350F" />
          </SvgGradient>
          <SvgGradient id="cupBaseGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#D97706" />
            <Stop offset="40%" stopColor="#B45309" />
            <Stop offset="100%" stopColor="#451A03" />
          </SvgGradient>
        </Defs>

        {/* Trophy Ground Shadow */}
        <Ellipse cx="50" cy="82" rx="26" ry="4" fill="#050C1B" fillOpacity="0.5" />

        {/* Left Sculpted Handle */}
        <Path
          d="M 28 20 C 14 20, 12 40, 28 46 L 31 41 C 20 37, 20 25, 29 25 Z"
          fill="url(#goldCupGrad)"
          stroke="#B45309"
          strokeWidth="1"
        />

        {/* Right Sculpted Handle */}
        <Path
          d="M 72 20 C 86 20, 88 40, 72 46 L 69 41 C 80 37, 80 25, 71 25 Z"
          fill="url(#goldCupGrad)"
          stroke="#B45309"
          strokeWidth="1"
        />

        {/* Cup Pedestal Base */}
        <Polygon points="36,74 64,74 68,81 32,81" fill="url(#cupBaseGrad)" stroke="#78350F" strokeWidth="0.8" />
        {/* Base Highlight Rim */}
        <Rect x="34" y="73" width="32" height="2" fill="#FDE047" rx="1" />

        {/* Cup Stem */}
        <Rect x="46" y="56" width="8" height="18" fill="url(#cupStemGrad)" rx="2" />
        {/* Stem Knocker Bead */}
        <Circle cx="50" cy="65" r="5" fill="url(#goldCupGrad)" stroke="#92400E" strokeWidth="0.8" />

        {/* Main Cup Body */}
        <Path
          d="M 26 14 Q 50 17 74 14 L 67 44 Q 50 58 33 44 Z"
          fill="url(#goldCupGrad)"
          stroke="#92400E"
          strokeWidth="1"
        />

        {/* Top Rim Lip */}
        <Ellipse cx="50" cy="14" rx="24" ry="4.5" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
        <Ellipse cx="50" cy="14" rx="21" ry="3" fill="#CA8A04" />

        {/* Center Embossed Star on Cup */}
        <Path
          d="M 50 24 L 52 30 L 58 30 L 53 34 L 55 40 L 50 36 L 45 40 L 47 34 L 42 30 L 48 30 Z"
          fill="#FFFBEB"
          stroke="#B45309"
          strokeWidth="0.6"
        />

        {/* Gloss Shine Curve on Cup */}
        <Path
          d="M 32 18 Q 36 32 37 42 Q 35 40 33 34 Q 31 24 32 18 Z"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />
      </Svg>
    </View>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// REDESIGNED VICTORY MODAL (WorMind Popup Design Language)
// ══════════════════════════════════════════════════════════════════════════════
export interface VictoryModalProps {
  visible: boolean;
  levelId: number;
  maxWordStreak: number;
  coinsEarned?: number;
  strikeEarned?: number;
  xpEarned?: number;
  onNextLevel: () => void;
  onGoToMap: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  visible,
  levelId,
  maxWordStreak,
  coinsEarned = 50,
  strikeEarned = 10,
  xpEarned = 100,
  onNextLevel,
  onGoToMap,
}) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const star1Scale = useRef(new Animated.Value(0)).current;
  const star2Scale = useRef(new Animated.Value(0)).current;
  const star3Scale = useRef(new Animated.Value(0)).current;
  const rewardsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      cardScale.setValue(0.7);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      rewardsFade.setValue(0);

      Animated.parallel([
        // Energetic spring pop of the master wooden frame
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 6,
          tension: 65,
          useNativeDriver: true,
        }),
        // Staggered bounce for the 3 stars
        Animated.stagger(80, [
          Animated.spring(star1Scale, { toValue: 1, friction: 4, tension: 75, useNativeDriver: true }),
          Animated.spring(star2Scale, { toValue: 1, friction: 3.5, tension: 75, useNativeDriver: true }),
          Animated.spring(star3Scale, { toValue: 1, friction: 4, tension: 75, useNativeDriver: true }),
        ]),
        // Smooth slide-up fade for rewards inset
        Animated.sequence([
          Animated.delay(120),
          Animated.timing(rewardsFade, {
            toValue: 1,
            duration: 250,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      cardScale.setValue(0.7);
      star1Scale.setValue(0);
      star2Scale.setValue(0);
      star3Scale.setValue(0);
      rewardsFade.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.modalBackdrop}>
        {/* Confetti & Streamers Celebration Overlay */}
        <PartyConfetti active={visible} />

        {/* Scrollable Centerpiece Modal */}
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ transform: [{ scale: cardScale }] }}>
            <WoodenPopupCard
              ribbonTitle="VICTORY!"
              ribbonVariant="gold"
              maxWidth={330}
              cardGradient={['#1E4C9A', '#13356E', '#0B1E43']}
              innerBorderColor="#38BDF8"
            >
              {/* Level Subtitle */}
              <Text style={styles.victorySubtitle}>Level {levelId} Complete!</Text>

              {/* Optional Best Word Flame Streak Badge */}
              {maxWordStreak > 1 && (
                <View style={styles.streakPill}>
                  <MaterialIcons name="local-fire-department" size={15} color="#FF6B00" />
                  <Text style={styles.streakPillText}>{maxWordStreak}x Flame Streak!</Text>
                </View>
              )}

              {/* Centerpiece: Golden Trophy & 3 Bouncing Stars */}
              <View style={styles.trophyCenterWrapper}>
                <VictoryTrophyVector
                  size={140}
                  star1Scale={star1Scale}
                  star2Scale={star2Scale}
                  star3Scale={star3Scale}
                />
              </View>

              {/* Rewards Inset Container */}
              <Animated.View
                style={[
                  styles.rewardsInsetCard,
                  {
                    opacity: rewardsFade,
                    transform: [
                      {
                        translateY: rewardsFade.interpolate({
                          inputRange: [0, 1],
                          outputRange: [12, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Rewards Header */}
                <View style={styles.rewardsHeaderRow}>
                  <View style={styles.headerLine} />
                  <Text style={styles.rewardsHeaderTitle}>✦ REWARDS EARNED ✦</Text>
                  <View style={styles.headerLine} />
                </View>

                {/* 3 Distinct Tactile Reward Boxes */}
                <View style={styles.rewardBadgesRow}>
                  {/* Coins Badge */}
                  <View style={[styles.rewardBadgeBox, styles.coinsBadgeBox]}>
                    <View style={styles.badgeIconCircleGold}>
                      <MaterialIcons name="monetization-on" size={24} color="#FFD700" />
                    </View>
                    <Text style={styles.badgeAmountGold}>+{coinsEarned}</Text>
                    <Text style={styles.badgeLabelGold}>Coins</Text>
                  </View>

                  {/* Flame Streak Badge */}
                  <View style={[styles.rewardBadgeBox, styles.strikeBadgeBox]}>
                    <View style={styles.badgeIconCircleOrange}>
                      <MaterialIcons name="local-fire-department" size={24} color="#FF5722" />
                    </View>
                    <Text style={styles.badgeAmountOrange}>+{strikeEarned}</Text>
                    <Text style={styles.badgeLabelOrange}>Flame 🔥</Text>
                  </View>

                  {/* XP Badge */}
                  <View style={[styles.rewardBadgeBox, styles.xpBadgeBox]}>
                    <View style={styles.badgeIconCircleViolet}>
                      <MaterialIcons name="military-tech" size={24} color="#C084FC" />
                    </View>
                    <Text style={styles.badgeAmountViolet}>+{xpEarned}</Text>
                    <Text style={styles.badgeLabelViolet}>XP</Text>
                  </View>
                </View>
              </Animated.View>

              {/* 3D Action Buttons Stack */}
              <View style={styles.actionBtnStack}>
                <Game3DButton
                  title="NEXT LEVEL"
                  variant="green"
                  height={52}
                  icon="arrow-forward"
                  onPress={onNextLevel}
                />
                <Game3DButton
                  title="EXIT TO MAP"
                  variant="purple"
                  height={44}
                  icon="map"
                  onPress={onGoToMap}
                />
              </View>
            </WoodenPopupCard>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 12, 27, 0.82)',
  },
  modalScroll: {
    width: '100%',
  },
  modalScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 16,
  },

  // Level Subtitle
  victorySubtitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E0E7FF',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Streak Pill
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FB923C',
    gap: 4,
    marginVertical: 4,
  },
  streakPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD7AA',
    letterSpacing: 0.5,
  },

  // Trophy Centerpiece
  trophyCenterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  trophyWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  trophySunburst: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trophySparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  trophyStarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: -8,
    zIndex: 10,
  },
  starGlow: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },

  // Rewards Inset Card
  rewardsInsetCard: {
    width: '100%',
    backgroundColor: 'rgba(11, 28, 62, 0.85)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.28)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginVertical: 6,
  },
  rewardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.3)',
  },
  rewardsHeaderTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#BAE6FD',
    letterSpacing: 1.2,
    marginHorizontal: 8,
  },
  rewardBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
  },
  rewardBadgeBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  coinsBadgeBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#F59E0B',
  },
  strikeBadgeBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#EF4444',
  },
  xpBadgeBox: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: '#A855F7',
  },
  badgeIconCircleGold: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  badgeIconCircleOrange: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  badgeIconCircleViolet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(168, 85, 247, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  badgeAmountGold: {
    color: '#FDE047',
    fontSize: 14,
    fontWeight: '900',
  },
  badgeLabelGold: {
    color: '#FEF08A',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  badgeAmountOrange: {
    color: '#FB923C',
    fontSize: 14,
    fontWeight: '900',
  },
  badgeLabelOrange: {
    color: '#FED7AA',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },
  badgeAmountViolet: {
    color: '#E9D5FF',
    fontSize: 14,
    fontWeight: '900',
  },
  badgeLabelViolet: {
    color: '#F3E8FF',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 1,
  },

  // 3D Buttons Stack
  actionBtnStack: {
    width: '100%',
    marginTop: 4,
    gap: 2,
  },
});
