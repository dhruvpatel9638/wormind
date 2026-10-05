import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { DAILY_REWARDS } from '../../data/gameData';
import { nativeAudio } from '../audio';
import { SvgSpinWheel, WHEEL_SEGMENTS } from '../components/SvgSpinWheel';

const SPINS_STORAGE_KEY = '@wormind_daily_spins_count_v1';
const MAX_DAILY_SPINS = 3;

interface DailyViewProps {
  claimedDays?: number[];
  canClaimToday?: boolean;
  currentDayToClaim?: number;
  streak?: number;
  onClaimDaily?: (day: number) => void;
  hasClaimedDay5?: boolean;
  onClaimDay5?: () => void;
  onAddCoins: (amount: number) => void;
  onAddHints: (amount: number) => void;
}

export const NativeDailyView: React.FC<DailyViewProps> = ({
  claimedDays = [1, 2, 3, 4],
  canClaimToday = true,
  currentDayToClaim = 5,
  streak = 5,
  onClaimDaily,
  hasClaimedDay5,
  onClaimDay5,
  onAddCoins,
  onAddHints,
}) => {
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [claimedMessage, setClaimedMessage] = useState<string>('You received your daily reward!');
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);
  const [spinsUsed, setSpinsUsed] = useState<number>(0);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const winScaleAnim = useRef(new Animated.Value(0)).current;
  const winIconAnim = useRef(new Animated.Value(0)).current;

  // Track 3 daily spins limit
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    AsyncStorage.getItem(SPINS_STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          if (parsed.date === todayStr) {
            setSpinsUsed(typeof parsed.count === 'number' ? parsed.count : 0);
          } else {
            setSpinsUsed(0);
            AsyncStorage.setItem(SPINS_STORAGE_KEY, JSON.stringify({ date: todayStr, count: 0 }));
          }
        } catch {}
      }
    });
  }, []);

  const handleClaim = (day: number) => {
    if (!canClaimToday) return;
    const reward = DAILY_REWARDS.find((r) => r.day === day) || DAILY_REWARDS[0];
    nativeAudio.playCoin();

    if (onClaimDaily) {
      onClaimDaily(day);
    } else {
      if (onClaimDay5) onClaimDay5();
      if (reward.coins) onAddCoins(reward.coins);
      if (reward.hints) onAddHints(reward.hints);
    }

    let msg = `You received ${reward.rewardText}!`;
    if (reward.coins > 0 && reward.hints > 0) {
      msg = `You received +${reward.coins} Coins and +${reward.hints} Free Hints!`;
    } else if (reward.coins > 0) {
      msg = `You received +${reward.coins} Coins!`;
    } else if (reward.hints > 0) {
      msg = `You received +${reward.hints} Free Hints!`;
    }
    setClaimedMessage(msg);
    setShowClaimModal(true);
  };



  const handleSpin = () => {
    if (isSpinning || spinsUsed >= MAX_DAILY_SPINS) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newSpinsUsed = spinsUsed + 1;
    setSpinsUsed(newSpinsUsed);
    AsyncStorage.setItem(SPINS_STORAGE_KEY, JSON.stringify({ date: todayStr, count: newSpinsUsed })).catch(() => {});

    setIsSpinning(true);
    nativeAudio.playSparkle();

    const selectedIdx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const targetDegrees = 360 * 5 + (360 - selectedIdx * 60 - 30);

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: targetDegrees,
      duration: 3500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      const wonItem = WHEEL_SEGMENTS[selectedIdx];
      setWheelPrize(wonItem.prize);
      nativeAudio.playVictory();

      if (wonItem.prize.includes('250')) onAddCoins(250);
      else if (wonItem.prize.includes('100')) onAddCoins(100);
      else if (wonItem.prize.includes('50')) onAddCoins(50);
      else if (wonItem.prize.includes('25')) onAddCoins(25);
      else if (wonItem.prize.includes('+5')) onAddCoins(5);
      else if (wonItem.prize.includes('1x')) onAddHints(1);

      setShowWinModal(true);
      winScaleAnim.setValue(0);
      winIconAnim.setValue(0);
      Animated.sequence([
        Animated.spring(winScaleAnim, { toValue: 1, friction: 5, tension: 45, useNativeDriver: true }),
        Animated.spring(winIconAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]).start();
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Status Banner */}
        <View style={styles.streakBanner}>
          <View style={styles.streakRow}>
            <View style={styles.fireCircle}>
              <MaterialIcons name="local-fire-department" size={26} color="#EF3B3B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.streakTitle}>{streak} DAY STREAK!</Text>
                <View style={styles.onFireBadge}>
                  <Text style={styles.onFireText}>HOT</Text>
                </View>
              </View>
              <Text style={styles.streakSub}>
                {canClaimToday
                  ? `Day ${currentDayToClaim} login reward is ready to claim!`
                  : `Reward claimed for today! Come back tomorrow for Day ${currentDayToClaim > 7 ? 1 : currentDayToClaim}.`}
              </Text>
            </View>
          </View>
        </View>

        {/* 7-Day Reward Track */}
        <Text style={styles.sectionTitle}>7-DAY LOGIN REWARDS</Text>
        <View style={styles.rewardsGrid}>
          {DAILY_REWARDS.map((reward) => {
            const isClaimed = claimedDays.includes(reward.day);
            const isReady = canClaimToday && reward.day === currentDayToClaim;

            return (
              <View
                key={reward.day}
                style={[
                  styles.rewardCard,
                  isReady && styles.rewardCardReady,
                  isClaimed && styles.rewardCardClaimed,
                ]}
              >
                <Text style={styles.rewardDay}>DAY {reward.day}</Text>
                <MaterialIcons
                  name={reward.isJackpot ? 'card-giftcard' : 'monetization-on'}
                  size={26}
                  color={isReady ? '#35C94A' : isClaimed ? '#7B8AB8' : '#FFC928'}
                />
                <Text style={[styles.rewardText, isReady && { color: '#35C94A', fontWeight: '900' }]}>
                  {reward.rewardText}
                </Text>

                {isClaimed ? (
                  <View style={styles.claimedPill}>
                    <Text style={styles.claimedPillText}>CLAIMED</Text>
                  </View>
                ) : isReady ? (
                  <Pressable
                    onPress={() => handleClaim(reward.day)}
                    style={({ pressed }) => [styles.claimBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.claimBtnText}>CLAIM</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.lockedText}>LOCKED</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Lucky Spin Wheel Section */}
        <View style={styles.wheelCard}>
          <View style={styles.wheelCardHeader}>
            <MaterialIcons name="stars" size={22} color="#F59E0B" />
            <Text style={styles.wheelTitle}>DAILY LUCKY SPIN</Text>
          </View>
          <Text style={styles.wheelSub}>Spin the wheel daily for free bonus coins & hints!</Text>

          {/* Remaining Spins Counter Badge */}
          <View style={styles.spinsCountBadge}>
            <MaterialIcons name="autorenew" size={14} color="#7C3AED" />
            <Text style={styles.spinsCountText}>
              SPINS REMAINING TODAY: {Math.max(0, MAX_DAILY_SPINS - spinsUsed)} / {MAX_DAILY_SPINS}
            </Text>
          </View>

          {/* Vector SVG Arcade Spin Wheel */}
          <SvgSpinWheel spinInterpolate={spinInterpolate} />

          {wheelPrize && (
            <View style={styles.wonBanner}>
              <MaterialIcons name="emoji-events" size={20} color="#D97706" />
              <Text style={styles.wonText}>🎉 WON: {wheelPrize}!</Text>
            </View>
          )}

          <Pressable
            disabled={isSpinning || spinsUsed >= MAX_DAILY_SPINS}
            onPress={handleSpin}
            style={({ pressed }) => [
              styles.spinBtn,
              spinsUsed >= MAX_DAILY_SPINS && styles.spinBtnDisabled,
              isSpinning && { opacity: 0.6 },
              pressed && spinsUsed < MAX_DAILY_SPINS && styles.pressed,
            ]}
          >
            <MaterialIcons name="cached" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.spinBtnText}>
              {spinsUsed >= MAX_DAILY_SPINS
                ? 'DAILY LIMIT REACHED (0/3 LEFT)'
                : isSpinning
                ? 'SPINNING...'
                : 'SPIN WHEEL NOW'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Spin Winner Celebration Modal */}
      <Modal visible={showWinModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.winCard, { transform: [{ scale: winScaleAnim }] }]}>
            <Animated.View style={[styles.winIconCircle, { transform: [{ scale: winIconAnim }] }]}>
              <MaterialIcons name="emoji-events" size={44} color="#5A3800" />
            </Animated.View>
            <Text style={styles.winTitle}>LUCKY SPIN REWARD!</Text>
            <Text style={styles.winSub}>Congratulations! You landed on:</Text>

            <View style={styles.prizeBadgeBox}>
              <MaterialIcons name="stars" size={24} color="#F59E0B" />
              <Text style={styles.prizeBadgeText}>{wheelPrize}</Text>
            </View>

            <Pressable
              onPress={() => setShowWinModal(false)}
              style={({ pressed }) => [styles.winClaimBtn, pressed && styles.pressed]}
            >
              <Text style={styles.winClaimBtnText}>COLLECT REWARD</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Reward Claimed Modal */}
      <Modal visible={showClaimModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.claimPopup}>
            <MaterialIcons name="celebration" size={48} color="#FFC928" />
            <Text style={styles.popupTitle}>REWARD CLAIMED!</Text>
            <Text style={styles.popupSub}>{claimedMessage}</Text>

            <Pressable
              onPress={() => setShowClaimModal(false)}
              style={({ pressed }) => [styles.popupBtn, pressed && styles.pressed]}
            >
              <Text style={styles.popupBtnText}>AWESOME!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
  },
  streakBanner: {
    backgroundColor: '#2E1065',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 16,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fireCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(239, 59, 59, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    color: '#EEF1FF',
    fontSize: 16,
    fontWeight: '900',
  },
  streakSub: {
    color: '#7B8AB8',
    fontSize: 11,
    marginTop: 2,
  },
  onFireBadge: {
    backgroundColor: '#FFC928',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  onFireText: {
    color: '#5A3800',
    fontSize: 9,
    fontWeight: '900',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#7C3AED',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  rewardCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    elevation: 2,
  },
  rewardCardReady: {
    borderColor: '#F59E0B',
    borderWidth: 2,
    backgroundColor: '#FEF3C7',
  },
  rewardCardClaimed: {
    opacity: 0.6,
    backgroundColor: '#F5F3FF',
  },
  rewardDay: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9B8EC0',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2E1065',
    textAlign: 'center',
    marginVertical: 4,
  },
  claimedPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  claimedPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8B7FB0',
  },
  claimBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  claimBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  lockedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#B0B8D0',
  },
  wheelCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#DDD6FE',
    elevation: 4,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  wheelCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wheelTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  wheelSub: {
    fontSize: 11,
    color: '#8B7FB0',
    marginTop: 2,
    marginBottom: 10,
    textAlign: 'center',
  },
  spinsCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3E8FF',
    borderWidth: 1.5,
    borderColor: '#C084FC',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  spinsCountText: {
    color: '#6B21A8',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  wheelWrapper: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  pointerContainer: {
    position: 'absolute',
    top: -8,
    zIndex: 20,
    alignItems: 'center',
  },
  pointerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 16,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F59E0B',
  },
  wheelCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2E1065',
    borderWidth: 5,
    borderColor: '#FFC928',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelSegment: {
    position: 'absolute',
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  wheelCenterPin: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFC928',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 4,
  },
  wonBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    marginBottom: 14,
    gap: 6,
  },
  wonText: {
    color: '#92400E',
    fontWeight: '900',
    fontSize: 13,
  },
  spinBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#7C3AED',
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#A78BFA',
  },
  spinBtnDisabled: {
    backgroundColor: '#9CA3AF',
    borderColor: '#D1D5DB',
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(46, 16, 101, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  claimPopup: {
    width: 270,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#7C3AED',
  },
  popupTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C3AED',
    marginTop: 8,
  },
  popupSub: {
    fontSize: 12,
    color: '#7B8AB8',
    textAlign: 'center',
    marginVertical: 10,
  },
  popupBtn: {
    width: '100%',
    height: 42,
    backgroundColor: '#7C3AED',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  winCard: {
    width: 280,
    backgroundColor: '#2E1065',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFC928',
    alignItems: 'center',
    padding: 22,
    elevation: 10,
  },
  winIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFC928',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: -44,
    marginBottom: 8,
  },
  winTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 4,
  },
  winSub: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  prizeBadgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginVertical: 16,
    gap: 8,
  },
  prizeBadgeText: {
    color: '#92400E',
    fontWeight: '900',
    fontSize: 16,
  },
  winClaimBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFC928',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  winClaimBtnText: {
    color: '#5A3800',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
