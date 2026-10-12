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
import { nativeAudio } from '../audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CenturyAchievementModalProps {
  visible: boolean;
  onClaim: () => void;
}

export const CenturyAchievementModal: React.FC<CenturyAchievementModalProps> = ({
  visible,
  onClaim,
}) => {
  const cardScale = useRef(new Animated.Value(0)).current;
  const sunburstRotate = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;
  const badgesFade = useRef(new Animated.Value(0)).current;
  const btnPulse = useRef(new Animated.Value(1)).current;

  // Rotating sunburst halo
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(sunburstRotate, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [sunburstRotate]);

  // Entrance animations
  useEffect(() => {
    if (visible) {
      cardScale.setValue(0);
      trophyBounce.setValue(0);
      badgesFade.setValue(0);
      btnPulse.setValue(1);

      nativeAudio.playVictory();

      Animated.sequence([
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.spring(trophyBounce, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(badgesFade, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Continuous button pulse
        Animated.loop(
          Animated.sequence([
            Animated.timing(btnPulse, {
              toValue: 1.04,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(btnPulse, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
  }, [visible]);

  const spinInterpolation = sunburstRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        {/* Confetti & Streamers Shower */}
        {visible && <PartyConfetti active={visible} />}

        {/* Rotating Sunburst Halo */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.sunburstWrapper,
            { transform: [{ rotate: spinInterpolation }] },
          ]}
        >
          {Array.from({ length: 16 }).map((_, idx) => (
            <View
              key={`ray-${idx}`}
              style={[
                styles.sunburstRay,
                { transform: [{ rotate: `${idx * 22.5}deg` }] },
              ]}
            />
          ))}
        </Animated.View>

        {/* Main Achievement Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <LinearGradient
            colors={['#2E1065', '#3B0764', '#1E1B4B']}
            style={styles.cardGradient}
          >
            {/* Top Golden Crown / Trophy Emblem */}
            <Animated.View
              style={[
                styles.trophyWrapper,
                {
                  transform: [
                    { scale: trophyBounce },
                    {
                      translateY: trophyBounce.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['#FEF08A', '#F59E0B', '#B45309']}
                style={styles.trophyCircle}
              >
                <MaterialIcons name="emoji-events" size={48} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.sparkleLeft}>
                <MaterialIcons name="auto-awesome" size={20} color="#FDE047" />
              </View>
              <View style={styles.sparkleRight}>
                <MaterialIcons name="auto-awesome" size={24} color="#FDE047" />
              </View>
            </Animated.View>

            {/* Achievement Ribbon Pill */}
            <View style={styles.pillBadge}>
              <MaterialIcons name="military-tech" size={14} color="#FDE047" />
              <Text style={styles.pillBadgeText}>CHAPTER 1 MASTERPIECE</Text>
            </View>

            {/* Achievement Titles */}
            <Text style={styles.title}>100 LEVELS CONQUERED!</Text>
            <Text style={styles.subtitle}>
              Spectacular triumph! You mastered all 100 levels of Sunny Valley!
            </Text>

            {/* Big Rewards Showcase */}
            <Animated.View style={[styles.rewardsContainer, { opacity: badgesFade }]}>
              {/* +200 Coins */}
              <LinearGradient
                colors={['#FEF3C7', '#FDE68A']}
                style={styles.rewardCard}
              >
                <View style={styles.rewardIconBgCoin}>
                  <Text style={styles.rewardEmoji}>🪙</Text>
                </View>
                <Text style={styles.rewardValue}>+200</Text>
                <Text style={styles.rewardLabel}>COINS</Text>
              </LinearGradient>

              {/* +100 Word Strike */}
              <LinearGradient
                colors={['#FFEDD5', '#FED7AA']}
                style={styles.rewardCard}
              >
                <View style={styles.rewardIconBgStrike}>
                  <Text style={styles.rewardEmoji}>🔥</Text>
                </View>
                <Text style={styles.rewardValue}>+100</Text>
                <Text style={styles.rewardLabel}>STRIKE</Text>
              </LinearGradient>

              {/* Chapter 2 Unlocked */}
              <LinearGradient
                colors={['#E0F2FE', '#BAE6FD']}
                style={styles.rewardCard}
              >
                <View style={styles.rewardIconBgOcean}>
                  <Text style={styles.rewardEmoji}>🌊</Text>
                </View>
                <Text style={styles.rewardValue}>UNLOCKED</Text>
                <Text style={styles.rewardLabel}>OCEAN</Text>
              </LinearGradient>
            </Animated.View>

            {/* Claim Reward Button */}
            <Animated.View style={{ transform: [{ scale: btnPulse }], width: '100%' }}>
              <Pressable
                onPress={() => {
                  nativeAudio.playVictory();
                  onClaim();
                }}
                style={({ pressed }) => [
                  styles.claimBtn,
                  pressed && styles.claimBtnPressed,
                ]}
              >
                <LinearGradient
                  colors={['#F59E0B', '#D97706', '#B45309']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.claimBtnGradient}
                >
                  <MaterialIcons name="redeem" size={22} color="#FFFFFF" />
                  <Text style={styles.claimBtnText}>CLAIM +200 COINS & +100 STRIKE</Text>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 7, 36, 0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  sunburstWrapper: {
    position: 'absolute',
    width: 600,
    height: 600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sunburstRay: {
    position: 'absolute',
    width: 32,
    height: 580,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderRadius: 16,
  },
  card: {
    width: Math.min(SCREEN_WIDTH - 36, 380),
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    borderWidth: 2.5,
    borderColor: '#FDE047',
  },
  cardGradient: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 24,
    alignItems: 'center',
  },
  trophyWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  trophyCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FEF08A',
    elevation: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  sparkleLeft: {
    position: 'absolute',
    top: -4,
    left: -14,
  },
  sparkleRight: {
    position: 'absolute',
    top: 6,
    right: -16,
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(253, 224, 71, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#FDE047',
    marginBottom: 10,
  },
  pillBadgeText: {
    color: '#FEF08A',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  subtitle: {
    color: '#E9D5FF',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  rewardsContainer: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
  rewardCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    elevation: 3,
  },
  rewardIconBgCoin: {
    marginBottom: 4,
  },
  rewardIconBgStrike: {
    marginBottom: 4,
  },
  rewardIconBgOcean: {
    marginBottom: 4,
  },
  rewardEmoji: {
    fontSize: 22,
  },
  rewardValue: {
    fontSize: 13,
    fontWeight: '900',
    color: '#451A03',
  },
  rewardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#78350F',
    letterSpacing: 0.3,
  },
  claimBtn: {
    width: '100%',
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  claimBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1.8,
    borderColor: '#FEF08A',
    borderRadius: 22,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  claimBtnPressed: {
    transform: [{ scale: 0.96 }],
  },
});
