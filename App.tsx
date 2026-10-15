import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StatusBar,
  Alert,
  AppState,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, PlayerState, DailyReward, SpinTicket } from './src/types';
import { NativeHeader } from './src/native/components/Header';
import { NativeBottomNav } from './src/native/components/BottomNav';
import { NativeWorldsView } from './src/native/views/WorldsView';
import { NativeGameView } from './src/native/views/GameView';
import { NativeDailyView } from './src/native/views/DailyView';
import { NativeProfileView } from './src/native/views/ProfileView';
import { AdBanner } from './src/native/components/AdBanner';
import { NativeLoadingScreen } from './src/native/components/LoadingScreen';
import { CustomAlert } from './src/native/components/CustomAlert';
import { CenturyAchievementModal } from './src/native/components/CenturyAchievementModal';
import { DAILY_REWARDS, INITIAL_LEVELS } from './src/data/gameData';
import { nativeAudio } from './src/native/audio';
import {
  completeDailySpin,
  claimDailyReward,
  rewardAvailability,
  spendHint,
  startDailySpin,
} from './src/native/rewardLogic';
import { initAdMob, showRewardedAd, showSmartInterstitialAd } from './src/utils/admobService';
import { STRIKE_LOSS_PENALTY, STRIKE_RESTORE_AMOUNT, STRIKE_WIN_REWARD } from './src/config/strike';
import {
  FREE_COINS_AD_REWARD,
  MILESTONE_CHEST_COINS,
  STARTING_COINS,
} from './src/config/economy';

const STORAGE_KEY = '@wormind_player_state_native_v1';
const DEFAULT_START_LEVEL = 1;
const START_DEV_COINS = STARTING_COINS;

function AppContent() {
  const insets = useSafeAreaInsets();
  const [bannerHeight, setBannerHeight] = useState(54);
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [hasLoadedPlayer, setHasLoadedPlayer] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('worlds');
  const [activeLevelId, setActiveLevelId] = useState<number>(DEFAULT_START_LEVEL);
  const [showRestoreStrikeModal, setShowRestoreStrikeModal] = useState<boolean>(false);
  const [isRestoringStrike, setIsRestoringStrike] = useState(false);
  const restoreStrikeInFlight = useRef(false);
  const [showStrikeInfoModal, setShowStrikeInfoModal] = useState<boolean>(false);
  const [showCenturyModal, setShowCenturyModal] = useState<boolean>(false);
  const [showRefillHeartsModal, setShowRefillHeartsModal] = useState<boolean>(false);
  const [showFreeCoinsModal, setShowFreeCoinsModal] = useState<boolean>(false);
  const [freeCoinsAlert, setFreeCoinsAlert] = useState<{
    title: string;
    message: string;
    icon?: keyof typeof MaterialIcons.glyphMap;
  } | null>(null);
  const [pendingLevelToStart, setPendingLevelToStart] = useState<number | null>(null);
  const saveQueue = useRef(Promise.resolve());

  const [playerState, setPlayerState] = useState<PlayerState>({
    coins: START_DEV_COINS,
    stars: 380,
    hearts: 5,
    maxHearts: 5,
    heartSeconds: 252,
    streak: 0,
    streakLvl: 2,
    streakMax: 7,
    claimedDays: [],
    hasClaimedDay5: false,
    equippedHat: 'none',
    unlockedHats: ['none', 'sunglasses'],
    solvedCount: 23,
    wordsDiscovered: 148,
    soundEnabled: true,
    musicEnabled: true,
    hapticsEnabled: true,
    currentLevel: DEFAULT_START_LEVEL,
    lastDailyClaimDate: null,
    strike: 10,
    strikeZeroFails: 0,
    claimedChests: [],
    hasClaimedCenturyAchievement: false,
  });
  const playerStateRef = useRef(playerState);

  const availability = rewardAvailability(playerState);
  // The UI and claim handler use this same local-date calculation, so the
  // displayed claimable day always matches the reward that can be claimed.
  const canClaimDaily = availability.canClaimDaily;
  const canSpinToday = availability.canSpinToday;
  const activeClaimedDays = availability.claimedDays;
  const currentDailyDay = availability.currentDay;

  // Initialize Google Mobile Ads SDK on app startup
  useEffect(() => {
    initAdMob();
  }, []);

  // Load saved state from native AsyncStorage
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const savedLevel = typeof parsed.currentLevel === 'number' && parsed.currentLevel >= 1
            ? parsed.currentLevel
            : DEFAULT_START_LEVEL;
          const savedCoins = typeof parsed.coins === 'number' && parsed.coins >= 0
            ? parsed.coins
            : START_DEV_COINS;
          const savedStrike = typeof parsed.strike === 'number' ? parsed.strike : 10;
          const savedZeroFails = typeof parsed.strikeZeroFails === 'number' ? parsed.strikeZeroFails : 0;
          const savedClaimedChests = Array.isArray(parsed.claimedChests) ? parsed.claimedChests : [];
          const savedHasClaimedCentury = Boolean(parsed.hasClaimedCenturyAchievement);
          // Older builds saved placeholder claims for Days 1–4 without a
          // claim date. Those were never real rewards, so restart that old
          // demo state at Day 1 instead of displaying an unclaimable Day 5.
          const hasLegacyDemoClaims = !parsed.lastDailyClaimDate
            && Array.isArray(parsed.claimedDays)
            && parsed.claimedDays.length > 0;
          setPlayerState((prev) => ({
            ...prev,
            ...parsed,
            coins: savedCoins,
            currentLevel: savedLevel,
            strike: savedStrike,
            strikeZeroFails: savedZeroFails,
            claimedChests: savedClaimedChests,
            hasClaimedCenturyAchievement: savedHasClaimedCentury,
            claimedDays: hasLegacyDemoClaims ? [] : (Array.isArray(parsed.claimedDays) ? parsed.claimedDays : []),
            streak: hasLegacyDemoClaims ? 0 : (typeof parsed.streak === 'number' ? parsed.streak : 0),
            hasClaimedDay5: hasLegacyDemoClaims ? false : Boolean(parsed.hasClaimedDay5),
          }));
          setActiveLevelId(savedLevel);
          nativeAudio.setSoundEnabled(parsed.soundEnabled ?? true);
          nativeAudio.setMusicEnabled(parsed.musicEnabled ?? true);
        } catch {}
      } else {
        setActiveLevelId(DEFAULT_START_LEVEL);
      }
    }).catch((error) => {
      console.warn('Could not load player progress:', error);
    }).finally(() => {
      if (mounted) setHasLoadedPlayer(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    playerStateRef.current = playerState;
  }, [playerState]);

  // Save state on change
  useEffect(() => {
    if (!hasLoadedPlayer) return;
    const snapshot = JSON.stringify(playerState);
    saveQueue.current = saveQueue.current.then(() => AsyncStorage.setItem(STORAGE_KEY, snapshot)).catch((error) => {
      console.warn('Could not save player progress:', error);
    });
    nativeAudio.setSoundEnabled(playerState.soundEnabled);
    nativeAudio.setMusicEnabled(playerState.musicEnabled);
  }, [playerState, hasLoadedPlayer]);

  // Hearts refill timer
  useEffect(() => {
    if (!hasLoadedPlayer) return;
    const timer = setInterval(() => {
      setPlayerState((prev) => {
        if (prev.hearts >= prev.maxHearts) {
          if (prev.heartSeconds === 252) return prev;
          return { ...prev, heartSeconds: 252 };
        }
        if (prev.heartSeconds <= 1) {
          return {
            ...prev,
            hearts: Math.min(prev.maxHearts, prev.hearts + 1),
            heartSeconds: 300,
          };
        }
        return { ...prev, heartSeconds: prev.heartSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [hasLoadedPlayer]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  const handleStartLevel = (levelId: number) => {
    if (!hasLoadedPlayer) return;
    if ((playerState.strike ?? 10) <= 0) {
      setPendingLevelToStart(levelId);
      setShowRestoreStrikeModal(true);
      return;
    }
    setActiveLevelId(levelId);
    setCurrentScreen('game');
  };

  const handleFailLevel = () => {
    setPlayerState((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
      strike: Math.max(0, (prev.strike ?? 0) - STRIKE_LOSS_PENALTY),
    }));
  };

  const handleRestoreStrike = (onSuccess?: () => void) => {
    if (!hasLoadedPlayer || restoreStrikeInFlight.current || (playerStateRef.current.strike ?? 10) > 0) return;
    restoreStrikeInFlight.current = true;
    setIsRestoringStrike(true);
    let rewardGranted = false;
    let finished = false;

    showRewardedAd(
      () => {
        if (finished || rewardGranted) return;
        rewardGranted = true;
        setPlayerState((prev) => {
          // Preserve strike earned elsewhere while the ad was open.
          if ((prev.strike ?? 10) > 0) return prev;
          return {
            ...prev,
            strike: STRIKE_RESTORE_AMOUNT,
            strikeZeroFails: 0,
          };
        });
        Alert.alert('🔥 Strike Restored!', 'Your flame is ready! Keep playing.');
        if (onSuccess) onSuccess();
      },
      () => {
        if (finished) return;
        Alert.alert('Ad Unavailable', 'Could not load rewarded ad. Please try again in a moment.');
      },
      () => {
        if (finished) return;
        finished = true;
        restoreStrikeInFlight.current = false;
        setIsRestoringStrike(false);
      }
    );
  };

  const handleCompleteLevel = (levelId: number, starsEarned: number, coinsEarned: number) => {
    // 🔹 Smart AdMob Interstitial Ad (Randomized Win + 3-min Time Auto-Trigger)
    showSmartInterstitialAd();

    const nextLevel = levelId < 200 ? levelId + 1 : 200;

    setPlayerState((prev) => {
      const currentHighest = prev.currentLevel || 1;
      const updatedHighest = Math.max(currentHighest, nextLevel);
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        xp: (prev.xp ?? 0) + 100,
        stars: prev.stars + starsEarned,
        solvedCount: prev.solvedCount + 1,
        wordsDiscovered: prev.wordsDiscovered + 5,
        currentLevel: updatedHighest,
        strike: (prev.strike ?? 0) + STRIKE_WIN_REWARD,
      };
    });

    setActiveLevelId((prev) => Math.max(prev, nextLevel));
    setCurrentScreen('worlds');

    if (levelId === 100 && !playerState.hasClaimedCenturyAchievement) {
      setTimeout(() => {
        setShowCenturyModal(true);
      }, 450);
    }
  };

  const handleClaimCenturyAchievement = () => {
    setPlayerState((prev) => {
      if (prev.hasClaimedCenturyAchievement) return prev;
      return {
        ...prev,
        coins: prev.coins + 200,
        strike: (prev.strike || 0) + 100,
        hasClaimedCenturyAchievement: true,
      };
    });
    nativeAudio.playVictory();
    setShowCenturyModal(false);
  };

  const handleAddCoins = (amount: number) => {
    setPlayerState((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleClaimMilestoneChest = (levelId: number) => {
    setPlayerState((prev) => {
      const claimedChests = prev.claimedChests ?? [];
      if (claimedChests.includes(levelId)) return prev;
      return {
        ...prev,
        claimedChests: [...claimedChests, levelId],
        coins: prev.coins + MILESTONE_CHEST_COINS,
        strike: (prev.strike ?? 0) + 50,
      };
    });
    nativeAudio.playVictory();
  };

  const handleWatchAdForCoins = () => {
    showRewardedAd(
      () => {
        handleAddCoins(FREE_COINS_AD_REWARD);
        setShowFreeCoinsModal(false);
        setFreeCoinsAlert({
          title: 'COINS EARNED!',
          message: `${FREE_COINS_AD_REWARD} coins were added to your balance.`,
          icon: 'monetization-on',
        });
      },
      () => {
        setFreeCoinsAlert({
          title: 'AD UNAVAILABLE',
          message: 'Could not load an ad. Please try again in a moment.',
          icon: 'error-outline',
        });
      }
    );
  };

  const handleDeductCoins = (amount: number): boolean => {
    if (!hasLoadedPlayer || !Number.isFinite(amount) || amount < 0 || playerStateRef.current.coins < amount) return false;
    const next = { ...playerStateRef.current, coins: playerStateRef.current.coins - amount };
    playerStateRef.current = next;
    setPlayerState(next);
    return true;
  };

  const handleUseHint = (): boolean => {
    if (!hasLoadedPlayer) return false;
    const next = spendHint(playerStateRef.current);
    if (next === playerStateRef.current) return false;
    playerStateRef.current = next;
    setPlayerState(next);
    return true;
  };

  const handleRefillHearts = () => {
    setPlayerState((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      heartSeconds: 252,
    }));
  };

  const handleClaimDaily = (day: number): DailyReward | null => {
    if (!hasLoadedPlayer) return null;
    const next = claimDailyReward(playerStateRef.current, day, new Date());
    if (next === playerStateRef.current) return null;
    setPlayerState(next);
    return DAILY_REWARDS.find((reward) => reward.day === day) ?? null;
  };

  const handleStartSpin = (): SpinTicket | null => {
    if (!hasLoadedPlayer || !rewardAvailability(playerStateRef.current).canSpinToday) return null;
    const next = startDailySpin(playerStateRef.current);
    setPlayerState(next);
    return next.pendingSpin ?? null;
  };

  const handleCompleteSpin = (ticket: SpinTicket): boolean => {
    if (!hasLoadedPlayer) return false;
    const next = completeDailySpin(playerStateRef.current, ticket, new Date());
    if (next === playerStateRef.current) return false;
    setPlayerState(next);
    return true;
  };

  const handleToggleSound = () => {
    setPlayerState((prev) => {
      const next = !prev.soundEnabled;
      nativeAudio.setSoundEnabled(next);
      return { ...prev, soundEnabled: next };
    });
  };

  const handleToggleMusic = () => {
    setPlayerState((prev) => {
      const next = !prev.musicEnabled;
      nativeAudio.setMusicEnabled(next);
      return { ...prev, musicEnabled: next };
    });
  };

  const handleToggleHaptics = () => {
    setPlayerState((prev) => ({ ...prev, hapticsEnabled: !prev.hapticsEnabled }));
  };

  const handleResetProgress = () => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setPlayerState({
      coins: START_DEV_COINS,
      stars: 380,
      hearts: 5,
      maxHearts: 5,
      heartSeconds: 252,
      streak: 0,
      streakLvl: 2,
      streakMax: 7,
      claimedDays: [],
      hasClaimedDay5: false,
      equippedHat: 'none',
      unlockedHats: ['none', 'sunglasses'],
      solvedCount: 23,
      wordsDiscovered: 148,
      soundEnabled: true,
      musicEnabled: true,
      hapticsEnabled: true,
      currentLevel: DEFAULT_START_LEVEL,
      lastDailyClaimDate: null,
      strike: 10,
      strikeZeroFails: 0,
      claimedChests: [],
      hasClaimedCenturyAchievement: false,
    });
    setActiveLevelId(DEFAULT_START_LEVEL);
  };

  if (isAppLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <NativeLoadingScreen onFinish={() => setIsAppLoading(false)} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Keep the gameplay HUD out of the startup loading screen. On Android,
          elevated header badges can otherwise draw above an absolute overlay. */}
      {!isAppLoading && (
        <NativeHeader
          coins={playerState.coins}
          hearts={playerState.hearts}
          maxHearts={playerState.maxHearts}
          heartCountdown={formatCountdown(playerState.heartSeconds)}
          level={activeLevelId}
          strike={playerState.strike ?? 10}
          onPressStrike={() => setShowRestoreStrikeModal(true)}
        onOpenShop={() => setShowFreeCoinsModal(true)}
        onRefillHearts={() => setShowRefillHeartsModal(true)}
        musicEnabled={playerState.musicEnabled}
        onToggleMusic={handleToggleMusic}
      />
      )}

      {/* Screen Views */}
      <View
        style={[
          styles.screenContainer,
          {
            paddingBottom:
              (bannerHeight > 0 ? bannerHeight : insets.bottom) +
              (currentScreen === 'game' ? 0 : 66),
          },
        ]}
      >
        {currentScreen === 'worlds' && (
          <NativeWorldsView
            onStartLevel={handleStartLevel}
            activeLevelId={playerState.currentLevel || activeLevelId}
            claimedChests={playerState.claimedChests || []}
            onClaimChest={handleClaimMilestoneChest}
          />
        )}

        {currentScreen === 'game' && (
          <NativeGameView
            levelId={activeLevelId}
            onExit={() => setCurrentScreen('worlds')}
            onCompleteLevel={handleCompleteLevel}
            coins={playerState.coins}
            onDeductCoins={handleDeductCoins}
            onUseHint={handleUseHint}
            strike={playerState.strike ?? 10}
            strikeZeroFails={playerState.strikeZeroFails ?? 0}
            onFailLevel={handleFailLevel}
            onRestoreStrike={handleRestoreStrike}
            isRestoringStrike={isRestoringStrike}
          />
        )}

        {currentScreen === 'daily' && (
          <NativeDailyView
            claimedDays={activeClaimedDays}
            canClaimToday={canClaimDaily}
            currentDayToClaim={currentDailyDay}
            streak={availability.streak}
            onClaimDaily={handleClaimDaily}
            canSpinToday={canSpinToday}
            onStartSpin={handleStartSpin}
            onCompleteSpin={handleCompleteSpin}
          />
        )}

        {currentScreen === 'profile' && (
          <NativeProfileView
            playerState={playerState}
            onToggleSound={handleToggleSound}
            onToggleMusic={handleToggleMusic}
            onToggleHaptics={handleToggleHaptics}
            onResetProgress={handleResetProgress}
          />
        )}
      </View>

      {/* Bottom AdMob Banner Ad */}
      <AdBanner bottomInset={insets.bottom} onHeightChange={setBannerHeight} />

      {/* Bottom Floating Navigation (shown outside game view) */}
      {currentScreen !== 'game' && (
        <NativeBottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          hasClaimableDaily={canClaimDaily}
          bottomOffset={(bannerHeight > 0 ? bannerHeight : insets.bottom) + 4}
        />
      )}

      {/* Refill Hearts Modal */}
      <Modal visible={showRefillHeartsModal} transparent animationType="fade">
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalBackdrop}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.restoreCard}>
            <View style={[styles.fireHeaderCircle, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
              <MaterialIcons name="favorite" size={44} color="#EF4444" />
            </View>
            <Text style={[styles.restoreTitle, { color: '#DC2626' }]}>
              {playerState.hearts <= 0 ? 'OUT OF HEARTS! ❤️' : 'REFILL HEARTS ❤️'}
            </Text>
            <Text style={styles.restoreSub}>
              {playerState.hearts <= 0
                ? `You need at least 1 heart to play levels. Refill now with 50 Coins or wait for the timer (${formatCountdown(playerState.heartSeconds)}).`
                : playerState.hearts >= playerState.maxHearts
                ? `Your hearts are currently at max capacity (${playerState.hearts}/${playerState.maxHearts}).`
                : `Your hearts: ${playerState.hearts}/${playerState.maxHearts}. Refill to full 5 hearts now for 50 Coins!`}
            </Text>

            <View style={styles.restorePriceBox}>
              <Text style={styles.restorePriceLabel}>REFILL COST:</Text>
              <View style={styles.priceRow}>
                <MaterialIcons name="monetization-on" size={24} color="#F59E0B" />
                <Text style={styles.priceText}>50 Coins</Text>
              </View>
              <Text style={styles.currentCoinsText}>
                Your Coins: {playerState.coins.toLocaleString()}
              </Text>
            </View>

            <View style={styles.restoreBtnRow}>
              <Pressable
                onPress={() => setShowRefillHeartsModal(false)}
                style={({ pressed }) => [styles.restoreCancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.restoreCancelText}>CLOSE</Text>
              </Pressable>

              <Pressable
                disabled={playerState.hearts >= playerState.maxHearts}
                onPress={() => {
                  if (playerState.hearts >= playerState.maxHearts) return;
                  if (handleDeductCoins(50)) {
                    handleRefillHearts();
                    setShowRefillHeartsModal(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.restoreConfirmBtn,
                  { backgroundColor: '#DC2626' },
                  playerState.hearts >= playerState.maxHearts && { backgroundColor: '#CBD5E1', opacity: 0.6 },
                  pressed && playerState.hearts < playerState.maxHearts && styles.pressed,
                ]}
              >
                <Text
                  style={[
                    styles.restoreConfirmText,
                    playerState.hearts >= playerState.maxHearts && { color: '#64748B' },
                  ]}
                >
                  {playerState.hearts >= playerState.maxHearts ? 'FULL (5/5)' : 'REFILL (50 🪙)'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Snapchat Strike Restore & Info Modal (Modern Game UI/UX) */}
      <Modal
        visible={showRestoreStrikeModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (restoreStrikeInFlight.current) return;
          setShowRestoreStrikeModal(false);
          setPendingLevelToStart(null);
        }}
      >
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalBackdrop}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.strikeCard}>
            {/* Top Close Button */}
            <Pressable
              disabled={isRestoringStrike}
              onPress={() => {
                if (restoreStrikeInFlight.current) return;
                setShowRestoreStrikeModal(false);
                setPendingLevelToStart(null);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={[styles.modalCloseCornerBtn, isRestoringStrike && styles.disabled]}
            >
              <MaterialIcons name="close" size={20} color="#94A3B8" />
            </Pressable>

            {/* Glowing 3D Flame Crest with Gradient */}
            <View style={styles.strikeFlameGlowWrapper}>
              <LinearGradient
                colors={
                  (playerState.strike ?? 10) <= 0
                    ? ['#FF4500', '#DC2626']
                    : ['#FF8A00', '#FF3D00']
                }
                style={styles.strikeFlameCircle}
              >
                <MaterialIcons name="local-fire-department" size={46} color="#FFFFFF" />
              </LinearGradient>
              <View
                style={[
                  styles.strikePillTag,
                  {
                    backgroundColor:
                      (playerState.strike ?? 10) <= 0 ? '#FEF2F2' : '#FFF7ED',
                    borderColor:
                      (playerState.strike ?? 10) <= 0 ? '#FCA5A5' : '#FDBA74',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.strikePillTagText,
                    {
                      color:
                        (playerState.strike ?? 10) <= 0 ? '#DC2626' : '#EA580C',
                    },
                  ]}
                >
                  {(playerState.strike ?? 10) <= 0 ? 'FLAME AT 0' : 'STRIKE ACTIVE'}
                </Text>
              </View>
            </View>

            {/* Modal Title & Subtitle */}
            <Text style={styles.strikeModalTitle}>
              {(playerState.strike ?? 10) <= 0
                ? 'REIGNITE YOUR STRIKE! 🔥'
                : 'SNAPCHAT STRIKE 🔥'}
            </Text>
            <Text style={styles.strikeModalSub}>
              {(playerState.strike ?? 10) <= 0
                ? 'Your flame has gone out! Watch 1 quick video ad to restore your strike and keep playing.'
                : 'Keep your streak burning bright! Solve puzzle levels to build up your fire power.'}
            </Text>

            {/* Sleek Stats Card with Gradient & Rules */}
            <LinearGradient
              colors={['#FFFBEB', '#FFF7ED']}
              style={styles.strikeStatsCard}
            >
              {/* Score Header Row */}
              <View style={styles.strikeScoreRow}>
                <View>
                  <Text style={styles.strikeScoreLabel}>CURRENT STRIKE</Text>
                  <View style={styles.strikeScoreValueRow}>
                    <MaterialIcons
                      name="whatshot"
                      size={24}
                      color={(playerState.strike ?? 10) <= 0 ? '#9CA3AF' : '#EA580C'}
                    />
                    <Text
                      style={[
                        styles.strikeScoreNumber,
                        (playerState.strike ?? 10) <= 0 && { color: '#9CA3AF' },
                      ]}
                    >
                      {playerState.strike ?? 10}x
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.strikeStatusBadge,
                    (playerState.strike ?? 10) <= 0
                      ? { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }
                      : { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' },
                  ]}
                >
                  <MaterialIcons
                    name={(playerState.strike ?? 10) <= 0 ? 'priority-high' : 'check-circle'}
                    size={14}
                    color={(playerState.strike ?? 10) <= 0 ? '#DC2626' : '#16A34A'}
                  />
                  <Text
                    style={[
                      styles.strikeStatusText,
                      {
                        color:
                          (playerState.strike ?? 10) <= 0 ? '#DC2626' : '#16A34A',
                      },
                    ]}
                  >
                    {(playerState.strike ?? 10) <= 0 ? 'NEEDS REIGNITE' : 'BURNING'}
                  </Text>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.strikeCardDivider} />

              {/* Rule Items */}
              <View style={styles.strikeRulesList}>
                <View style={styles.strikeRuleItem}>
                  <View style={[styles.ruleBullet, { backgroundColor: '#DCFCE7' }]}>
                    <MaterialIcons name="add" size={12} color="#15803D" />
                  </View>
                  <Text style={styles.ruleItemText}>
                    <Text style={styles.ruleBoldText}>+{STRIKE_WIN_REWARD} Strike</Text> added on each level won
                  </Text>
                </View>

                <View style={styles.strikeRuleItem}>
                  <View style={[styles.ruleBullet, { backgroundColor: '#FEE2E2' }]}>
                    <MaterialIcons name="remove" size={12} color="#DC2626" />
                  </View>
                  <Text style={styles.ruleItemText}>
                    <Text style={styles.ruleBoldText}>-{STRIKE_LOSS_PENALTY} Strike</Text> deducted if level timer runs out
                  </Text>
                </View>

                <View style={styles.strikeRuleItem}>
                  <View style={[styles.ruleBullet, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialIcons name="ondemand-video" size={12} color="#D97706" />
                  </View>
                  <Text style={styles.ruleItemText}>
                    <Text style={styles.ruleBoldText}>Watch 1 Video Ad</Text> restores back to {STRIKE_RESTORE_AMOUNT} 🔥 free
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* Bottom Action Buttons */}
            {(playerState.strike ?? 10) <= 0 ? (
              <View style={styles.strikeActionRow}>
                <Pressable
                  disabled={isRestoringStrike}
                  onPress={() => {
                    if (restoreStrikeInFlight.current) return;
                    setShowRestoreStrikeModal(false);
                    setPendingLevelToStart(null);
                  }}
                  style={({ pressed }) => [styles.strikeCancelBtn, isRestoringStrike && styles.disabled, pressed && styles.pressed]}
                >
                  <Text style={styles.strikeCancelText}>CANCEL</Text>
                </Pressable>

                <Pressable
                  disabled={isRestoringStrike}
                  onPress={() => {
                    handleRestoreStrike(() => {
                      setShowRestoreStrikeModal(false);
                      if (pendingLevelToStart !== null) {
                        setActiveLevelId(pendingLevelToStart);
                        setCurrentScreen('game');
                        setPendingLevelToStart(null);
                      }
                    });
                  }}
                  style={({ pressed }) => [styles.strikeAdBtnWrapper, isRestoringStrike && styles.disabled, pressed && styles.pressed]}
                >
                  <LinearGradient
                    colors={['#FF512F', '#F09819']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.strikeAdBtnGradient}
                  >
                    <MaterialIcons name="ondemand-video" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.strikeAdBtnText}>{isRestoringStrike ? 'LOADING...' : 'WATCH AD 🎬'}</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <Pressable
                disabled={isRestoringStrike}
                onPress={() => {
                  if (restoreStrikeInFlight.current) return;
                  setShowRestoreStrikeModal(false);
                }}
                style={({ pressed }) => [styles.strikeAwesomeBtn, isRestoringStrike && styles.disabled, pressed && styles.pressed]}
              >
                <LinearGradient
                  colors={['#FF7A00', '#FF3D00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.strikeAdBtnGradient}
                >
                  <MaterialIcons name="whatshot" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.strikeAdBtnText}>KEEP BURNING! 🔥</Text>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* Free Coins Rewarded Ad Modal */}
      <Modal visible={showFreeCoinsModal} transparent animationType="fade">
        <ScrollView
          style={styles.modalScroll}
          contentContainerStyle={styles.modalBackdrop}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.restoreCard}>
            <View style={[styles.fireHeaderCircle, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
              <MaterialIcons name="monetization-on" size={44} color="#D97706" />
            </View>
            <Text style={styles.restoreTitle}>GET FREE COINS! 🪙</Text>
            <Text style={styles.restoreSub}>
              Watch a short video ad to earn +{FREE_COINS_AD_REWARD} Coins for hints, restores, and reveals!
            </Text>

            <View style={styles.restorePriceBox}>
              <Text style={styles.restorePriceLabel}>REWARD:</Text>
              <View style={styles.priceRow}>
                <MaterialIcons name="monetization-on" size={24} color="#F59E0B" />
                <Text style={styles.priceText}>+{FREE_COINS_AD_REWARD} Coins</Text>
              </View>
              <Text style={styles.currentCoinsText}>
                Your Coins: {playerState.coins.toLocaleString()}
              </Text>
            </View>

            <View style={styles.restoreBtnRow}>
              <Pressable
                onPress={() => setShowFreeCoinsModal(false)}
                style={({ pressed }) => [styles.restoreCancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.restoreCancelText}>CANCEL</Text>
              </Pressable>

              <Pressable
                onPress={handleWatchAdForCoins}
                style={({ pressed }) => [styles.restoreConfirmBtn, { backgroundColor: '#059669' }, pressed && styles.pressed]}
              >
                <Text style={styles.restoreConfirmText}>WATCH AD 🎬</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </Modal>

      {/* Free Coins Result Alert */}
      {freeCoinsAlert && (
        <CustomAlert
          visible={!!freeCoinsAlert}
          title={freeCoinsAlert.title}
          message={freeCoinsAlert.message}
          icon={freeCoinsAlert.icon}
          btnText="AWESOME"
          onClose={() => setFreeCoinsAlert(null)}
        />
      )}

      {/* Word Strike Info Modal */}
      <CustomAlert
        visible={showStrikeInfoModal}
        title="WORD STRIKE"
        message={`Current Strike: ${playerState.strike ?? 10}!\n\n• Each level win gives +${STRIKE_WIN_REWARD} Strike!\n• Failing a level loses ${STRIKE_LOSS_PENALTY} Strike, down to 0.\n• If Strike hits 0, watch a rewarded ad to restore it to ${STRIKE_RESTORE_AMOUNT}!`}
        icon="local-fire-department"
        btnText="GOT IT"
        onClose={() => setShowStrikeInfoModal(false)}
      />

      {/* Century Milestone Achievement Modal (Level 100 Completion) */}
      <CenturyAchievementModal
        visible={showCenturyModal}
        onClaim={handleClaimCenturyAchievement}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#16022B',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8FF',
  },
  screenContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flexGrow: 1,
    backgroundColor: 'rgba(26, 11, 46, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalScroll: {
    flex: 1,
    backgroundColor: 'rgba(26, 11, 46, 0.75)',
  },
  restoreCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  fireHeaderCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  restoreTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
    marginBottom: 6,
  },
  restoreSub: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  restorePriceBox: {
    width: '100%',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  restorePriceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#B45309',
  },
  currentCoinsText: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 4,
    fontWeight: '600',
  },
  restoreBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  restoreCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restoreCancelText: {
    color: '#4B5563',
    fontWeight: '800',
    fontSize: 12,
  },
  restoreConfirmBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  restoreConfirmText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
  disabled: {
    opacity: 0.6,
  },
  strikeCard: {
    width: '100%',
    maxWidth: 326,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    elevation: 12,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    borderWidth: 2,
    borderColor: '#FED7AA',
    position: 'relative',
  },
  modalCloseCornerBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  strikeFlameGlowWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 2,
  },
  strikeFlameCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#FF4500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  strikePillTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: -8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  strikePillTagText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  strikeModalTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.3,
    marginBottom: 4,
    textAlign: 'center',
  },
  strikeModalSub: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  strikeStatsCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    padding: 12,
    marginBottom: 16,
  },
  strikeScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strikeScoreLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  strikeScoreValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  strikeScoreNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
  },
  strikeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  strikeStatusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  strikeCardDivider: {
    height: 1,
    backgroundColor: '#FED7AA',
    opacity: 0.7,
    marginVertical: 10,
  },
  strikeRulesList: {
    gap: 7,
  },
  strikeRuleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  ruleBullet: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleItemText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    flex: 1,
  },
  ruleBoldText: {
    color: '#1E293B',
    fontWeight: '900',
  },
  strikeActionRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  strikeCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  strikeCancelText: {
    color: '#64748B',
    fontWeight: '800',
    fontSize: 11.5,
  },
  strikeAdBtnWrapper: {
    flex: 1.4,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  strikeAwesomeBtn: {
    width: '100%',
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  strikeAdBtnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  strikeAdBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12.5,
    letterSpacing: 0.4,
  },
});
