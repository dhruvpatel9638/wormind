import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { DAILY_REWARDS } from '../../data/gameData';
import { nativeAudio } from '../audio';
import { LuckyWheel } from '../components/LuckyWheel';
import type { DailyReward, SpinTicket } from '../../types';

interface DailyViewProps {
  claimedDays: number[];
  canClaimToday: boolean;
  currentDayToClaim: number;
  streak: number;
  onClaimDaily: (day: number) => DailyReward | null;
  canSpinToday: boolean;
  onStartSpin: () => SpinTicket | null;
  onCompleteSpin: (ticket: SpinTicket) => boolean;
}

export const NativeDailyView: React.FC<DailyViewProps> = ({
  claimedDays,
  canClaimToday,
  currentDayToClaim,
  streak,
  onClaimDaily,
  canSpinToday,
  onStartSpin,
  onCompleteSpin,
}) => {
  const { width } = useWindowDimensions();
  const compact = width <= 360;
  const contentWidthStyle = { width: '100%' as const, maxWidth: 540, alignSelf: 'center' as const };

  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showWheelModal, setShowWheelModal] = useState<boolean>(false);
  const [showClaimModal, setShowClaimModal] = useState<boolean>(false);
  const [claimedMessage, setClaimedMessage] = useState<string>('You received your daily reward!');

  const handleClaim = (day: number) => {
    if (!canClaimToday) return;
    const reward = onClaimDaily(day);
    if (!reward) return;
    nativeAudio.playCoin();
    const parts = [
      reward.coins > 0 && `+${reward.coins} Coins`,
      reward.hat && reward.hatLabel,
    ].filter(Boolean);
    setClaimedMessage(`You received ${parts.join(', ')}!`);
    setShowCalendarModal(false);
    setShowClaimModal(true);
  };

  const todayReward = DAILY_REWARDS.find((r) => r.day === currentDayToClaim) || DAILY_REWARDS[0];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak Status Banner */}
        <View style={[styles.streakBanner, contentWidthStyle]}>
          <View style={styles.streakRow}>
            <View style={styles.fireCircle}>
              <MaterialIcons name="local-fire-department" size={26} color="#EF4444" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text allowFontScaling={false} style={styles.streakTitle}>{streak} DAY STREAK!</Text>
                <View style={styles.onFireBadge}>
                  <Text allowFontScaling={false} style={styles.onFireText}>HOT</Text>
                </View>
              </View>
              <Text allowFontScaling={false} style={styles.streakSub}>
                {canClaimToday
                  ? `Day ${currentDayToClaim} login reward is ready to claim!`
                  : `Reward claimed for today! Come back tomorrow for Day ${currentDayToClaim > 7 ? 1 : currentDayToClaim}.`}
              </Text>
            </View>
          </View>
        </View>

        {/* FEATURED CARD 1: DAILY REWARD */}
        <LinearGradient
          colors={['#2E1065', '#3B0764']}
          style={[styles.hubCard, contentWidthStyle]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: '#4C1D95', borderColor: '#F59E0B' }]}>
              <MaterialIcons name="card-giftcard" size={26} color="#FBBF24" />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={styles.titleRow}>
                <Text allowFontScaling={false} style={styles.cardTitle}>Daily Reward</Text>
                <View style={[styles.statusBadge, canClaimToday ? styles.badgeReady : styles.badgeDone]}>
                  <Text allowFontScaling={false} style={[styles.statusBadgeText, canClaimToday ? styles.badgeReadyText : styles.badgeDoneText]}>
                    {canClaimToday ? 'READY' : 'CLAIMED'}
                  </Text>
                </View>
              </View>
              <Text allowFontScaling={false} style={styles.quickShortText}>
                Day {currentDayToClaim} of 7 • {todayReward.rewardText}
              </Text>
            </View>
          </View>

          {/* Action Button: Opens Calendar Popup Modal */}
          <Pressable
            onPress={() => setShowCalendarModal(true)}
            style={({ pressed }) => [styles.actionButtonWrapper, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={canClaimToday ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons
                name={canClaimToday ? 'card-giftcard' : 'calendar-month'}
                size={20}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text allowFontScaling={false} style={styles.actionButtonText}>
                {canClaimToday ? 'CLAIM REWARD 🎁' : 'VIEW CALENDAR 📅'}
              </Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>

        {/* FEATURED CARD 2: SPINNING WHEEL */}
        <LinearGradient
          colors={['#4A044E', '#1E1B4B']}
          style={[styles.hubCard, styles.hubCardWheel, contentWidthStyle]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.cardIconCircle, { backgroundColor: '#701A75', borderColor: '#EC4899' }]}>
              <MaterialIcons name="casino" size={26} color="#F472B6" />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <View style={styles.titleRow}>
                <Text allowFontScaling={false} style={styles.cardTitle}>Spinning Wheel</Text>
                <View style={[styles.statusBadge, canSpinToday ? styles.badgeReady : styles.badgeDone]}>
                  <Text allowFontScaling={false} style={[styles.statusBadgeText, canSpinToday ? styles.badgeReadyText : styles.badgeDoneText]}>
                    {canSpinToday ? 'FREE SPIN' : 'DONE'}
                  </Text>
                </View>
              </View>
              <Text allowFontScaling={false} style={[styles.quickShortText, { color: '#FBCFE8' }]}>
                {canSpinToday ? '1 Free spin available today' : 'Next spin tomorrow'}
              </Text>
            </View>
          </View>

          {/* Action Button: Opens Lucky Wheel Popup Modal */}
          <Pressable
            onPress={() => setShowWheelModal(true)}
            style={({ pressed }) => [styles.actionButtonWrapper, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={canSpinToday ? ['#F59E0B', '#D97706'] : ['#8B5CF6', '#6D28D9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <MaterialIcons name="cached" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text allowFontScaling={false} style={styles.actionButtonText}>
                {canSpinToday ? 'SPIN WHEEL 🎡' : 'OPEN WHEEL 🎡'}
              </Text>
            </LinearGradient>
          </Pressable>
        </LinearGradient>
      </ScrollView>

      {/* MODAL 1: 7-DAY LOGIN REWARDS CALENDAR POPUP */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalBackdrop}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.calendarModalCard, contentWidthStyle]}>
            {/* Top Close Button */}
            <Pressable
              onPress={() => setShowCalendarModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.modalCloseCornerBtn}
            >
              <MaterialIcons name="close" size={22} color="#94A3B8" />
            </Pressable>

            {/* Header */}
            <View style={styles.calendarModalHeader}>
              <View style={[styles.fireCircle, { width: 40, height: 40, borderRadius: 20 }]}>
                <MaterialIcons name="card-giftcard" size={22} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text allowFontScaling={false} style={styles.calendarModalTitle}>7-Day Login Rewards</Text>
                <Text allowFontScaling={false} style={styles.calendarModalSub}>
                  Day {currentDayToClaim} of 7 • {canClaimToday ? 'Tap Claim to collect!' : 'Reward claimed for today!'}
                </Text>
              </View>
            </View>

            {/* Rewards Grid */}
            <View style={styles.rewardsGrid}>
              {DAILY_REWARDS.map((reward) => {
                const isClaimed = claimedDays.includes(reward.day);
                const isReady = canClaimToday && reward.day === currentDayToClaim;

                return (
                  <View
                    key={reward.day}
                    style={[
                      styles.rewardCard,
                      compact && styles.rewardCardCompact,
                      isReady && styles.rewardCardReady,
                      isClaimed && styles.rewardCardClaimed,
                    ]}
                  >
                    <Text allowFontScaling={false} style={styles.rewardDay}>DAY {reward.day}</Text>
                    <MaterialIcons
                      name={reward.isJackpot ? 'card-giftcard' : 'monetization-on'}
                      size={24}
                      color={isReady ? '#10B981' : isClaimed ? '#7B8AB8' : '#FFC928'}
                    />
                    <Text
                      allowFontScaling={false}
                      numberOfLines={2}
                      style={[styles.rewardText, isReady && { color: '#059669', fontWeight: '900' }]}
                    >
                      {reward.rewardText}
                    </Text>

                    {isClaimed ? (
                      <View style={styles.claimedPill}>
                        <Text allowFontScaling={false} style={styles.claimedPillText}>CLAIMED</Text>
                      </View>
                    ) : isReady ? (
                      <Pressable
                        onPress={() => handleClaim(reward.day)}
                        style={({ pressed }) => [styles.claimBtn, pressed && styles.pressed]}
                      >
                        <Text allowFontScaling={false} style={styles.claimBtnText}>CLAIM</Text>
                      </Pressable>
                    ) : (
                      <Text allowFontScaling={false} style={styles.lockedText}>LOCKED</Text>
                    )}
                  </View>
                );
              })}
            </View>

            {/* Modal Bottom Close */}
            <Pressable
              onPress={() => setShowCalendarModal(false)}
              style={({ pressed }) => [styles.modalBottomCloseBtn, pressed && styles.pressed]}
            >
              <Text allowFontScaling={false} style={styles.modalBottomCloseText}>CLOSE</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>

      {/* MODAL 2: ROYAL LUCKY WHEEL POPUP */}
      <Modal
        visible={showWheelModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWheelModal(false)}
      >
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalBackdrop}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.wheelModalContainer, contentWidthStyle]}>
            {/* Top Close Button */}
            <Pressable
              onPress={() => setShowWheelModal(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.wheelModalCloseCornerBtn}
            >
              <MaterialIcons name="close" size={24} color="#FFFFFF" />
            </Pressable>

            <LuckyWheel
              canSpinToday={canSpinToday}
              onStartSpin={onStartSpin}
              onCompleteSpin={onCompleteSpin}
            />

            <Pressable
              onPress={() => setShowWheelModal(false)}
              style={({ pressed }) => [styles.wheelModalBottomCloseBtn, pressed && styles.pressed]}
            >
              <Text allowFontScaling={false} style={styles.wheelModalBottomCloseText}>CLOSE WHEEL</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Modal>

      {/* MODAL 3: REWARD CLAIMED POPUP */}
      <Modal visible={showClaimModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.claimPopup}>
            <MaterialIcons name="celebration" size={48} color="#FFC928" />
            <Text allowFontScaling={false} style={styles.popupTitle}>REWARD CLAIMED!</Text>
            <Text allowFontScaling={false} style={styles.popupSub}>{claimedMessage}</Text>

            <Pressable
              onPress={() => setShowClaimModal(false)}
              style={({ pressed }) => [styles.popupBtn, pressed && styles.pressed]}
            >
              <Text allowFontScaling={false} style={styles.popupBtnText}>AWESOME!</Text>
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
    marginBottom: 14,
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
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakTitle: {
    color: '#EEF1FF',
    fontSize: 16,
    fontWeight: '900',
  },
  streakSub: {
    color: '#A5B4FC',
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

  /* Dual Featured Hub Cards */
  hubCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
    elevation: 4,
    shadowColor: '#2E1065',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  hubCardWheel: {
    borderColor: '#EC4899',
    shadowColor: '#701A75',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  cardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeReady: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  badgeDone: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderColor: '#A78BFA',
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
  },
  badgeReadyText: {
    color: '#15803D',
  },
  badgeDoneText: {
    color: '#DDD6FE',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  quickShortText: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  actionButtonWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
  },
  actionButtonGradient: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  /* Calendar Modal */
  modalScroll: {
    flex: 1,
  },
  modalBackdrop: {
    flexGrow: 1,
    backgroundColor: 'rgba(15, 7, 36, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  calendarModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2.5,
    borderColor: '#7C3AED',
    elevation: 8,
    position: 'relative',
    width: '100%',
  },
  modalCloseCornerBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingRight: 36,
  },
  calendarModalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2E1065',
  },
  calendarModalSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  rewardCard: {
    width: '31%',
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE9FE',
    elevation: 1,
  },
  rewardCardCompact: {
    width: '48%',
  },
  rewardCardReady: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#ECFDF5',
  },
  rewardCardClaimed: {
    opacity: 0.6,
    backgroundColor: '#F5F3FF',
  },
  rewardDay: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#9B8EC0',
    marginBottom: 3,
  },
  rewardText: {
    fontSize: 10.5,
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
    backgroundColor: '#10B981',
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
  modalBottomCloseBtn: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBottomCloseText: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 12,
  },

  /* Wheel Modal */
  wheelModalContainer: {
    width: '100%',
    position: 'relative',
    alignItems: 'center',
  },
  wheelModalCloseCornerBtn: {
    position: 'absolute',
    top: -8,
    right: 4,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelModalBottomCloseBtn: {
    marginTop: 10,
    height: 42,
    paddingHorizontal: 24,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelModalBottomCloseText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 0.5,
  },

  /* Reward Claimed Celebration Popup */
  claimPopup: {
    width: '100%',
    maxWidth: 280,
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
    transform: [{ scale: 0.96 }],
  },
});

