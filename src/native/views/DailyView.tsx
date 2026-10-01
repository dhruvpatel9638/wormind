import React, { useState, useRef } from 'react';
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
import { MaterialIcons } from '@expo/vector-icons';
import { DAILY_REWARDS } from '../../data/gameData';
import { nativeAudio } from '../audio';

interface DailyViewProps {
  hasClaimedDay5: boolean;
  onClaimDay5: () => void;
  onAddCoins: (amount: number) => void;
  onAddHints: (amount: number) => void;
}

export const NativeDailyView: React.FC<DailyViewProps> = ({
  hasClaimedDay5,
  onClaimDay5,
  onAddCoins,
  onAddHints,
}) => {
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [wheelPrize, setWheelPrize] = useState<string | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleClaim = () => {
    if (hasClaimedDay5) return;
    nativeAudio.playCoin();
    onClaimDay5();
    onAddCoins(150);
    onAddHints(2);
    setShowClaimModal(true);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    nativeAudio.playSparkle();

    spinAnim.setValue(0);
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setIsSpinning(false);
      const prizes = ['+50 Coins', '2x Hints', '+100 Coins', '+25 Coins'];
      const won = prizes[Math.floor(Math.random() * prizes.length)];
      setWheelPrize(won);
      nativeAudio.playVictory();

      if (won.includes('50')) onAddCoins(50);
      else if (won.includes('100')) onAddCoins(100);
      else if (won.includes('25')) onAddCoins(25);
      else if (won.includes('Hints')) onAddHints(2);
    });
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1440deg'],
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
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.streakTitle}>5 DAY STREAK!</Text>
                <View style={styles.onFireBadge}>
                  <Text style={styles.onFireText}>HOT</Text>
                </View>
              </View>
              <Text style={styles.streakSub}>Keep it going tomorrow for the Mega Chest!</Text>
            </View>
          </View>
        </View>

        {/* 7-Day Reward Track */}
        <Text style={styles.sectionTitle}>7-DAY LOGIN REWARDS</Text>
        <View style={styles.rewardsGrid}>
          {DAILY_REWARDS.map((reward) => {
            const isDay5 = reward.day === 5;
            const isClaimed = reward.day <= 4 || (isDay5 && hasClaimedDay5);
            const isReady = isDay5 && !hasClaimedDay5;

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
                    onPress={handleClaim}
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
          <Text style={styles.wheelTitle}>DAILY LUCKY SPIN</Text>
          <Text style={styles.wheelSub}>Spin the prize wheel for free bonus loot!</Text>

          <View style={styles.wheelWrapper}>
            <Animated.View style={[styles.wheelCircle, { transform: [{ rotate: spinInterpolate }] }]}>
              <View style={[styles.wheelSegment, { transform: [{ rotate: '0deg' }] }]}>
                <Text style={styles.segmentText}>🪙 50</Text>
              </View>
              <View style={[styles.wheelSegment, { transform: [{ rotate: '90deg' }] }]}>
                <Text style={styles.segmentText}>💡 2x</Text>
              </View>
              <View style={[styles.wheelSegment, { transform: [{ rotate: '180deg' }] }]}>
                <Text style={styles.segmentText}>🪙 100</Text>
              </View>
              <View style={[styles.wheelSegment, { transform: [{ rotate: '270deg' }] }]}>
                <Text style={styles.segmentText}>🪙 25</Text>
              </View>
            </Animated.View>
            <View style={styles.wheelCenterPin} />
          </View>

          {wheelPrize && (
            <View style={styles.wonBanner}>
              <Text style={styles.wonText}>🎉 You Won: {wheelPrize}!</Text>
            </View>
          )}

          <Pressable
            disabled={isSpinning}
            onPress={handleSpin}
            style={({ pressed }) => [
              styles.spinBtn,
              isSpinning && { opacity: 0.6 },
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.spinBtnText}>{isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Reward Claimed Modal */}
      <Modal visible={showClaimModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.claimPopup}>
            <MaterialIcons name="celebration" size={48} color="#FFC928" />
            <Text style={styles.popupTitle}>REWARD CLAIMED!</Text>
            <Text style={styles.popupSub}>You received +150 Coins and +2 Free Hints!</Text>

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
    paddingBottom: 120,
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
    elevation: 3,
  },
  wheelTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#6D28D9',
  },
  wheelSub: {
    fontSize: 11,
    color: '#8B7FB0',
    marginTop: 2,
    marginBottom: 16,
  },
  wheelWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  wheelCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#7C3AED',
    borderWidth: 4,
    borderColor: '#FFC928',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelSegment: {
    position: 'absolute',
    alignItems: 'center',
  },
  segmentText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  wheelCenterPin: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFC928',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  wonBanner: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginBottom: 12,
  },
  wonText: {
    color: '#5A3800',
    fontWeight: '800',
    fontSize: 13,
  },
  spinBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#7C3AED',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
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
  pressed: {
    transform: [{ scale: 0.95 }],
  },
});
