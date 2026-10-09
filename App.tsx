import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen, PlayerState } from './src/types';
import { NativeHeader } from './src/native/components/Header';
import { NativeBottomNav } from './src/native/components/BottomNav';
import { NativeWorldsView } from './src/native/views/WorldsView';
import { NativeGameView } from './src/native/views/GameView';
import { NativeDailyView } from './src/native/views/DailyView';
import { NativeProfileView } from './src/native/views/ProfileView';
import { AdBanner } from './src/native/components/AdBanner';
import { NativeLoadingScreen } from './src/native/components/LoadingScreen';
import { DAILY_REWARDS } from './src/data/gameData';
import { nativeAudio } from './src/native/audio';
import { initAdMob, showSmartInterstitialAd } from './src/utils/admobService';
import { CustomAlert } from './src/native/components/CustomAlert';

const getTodayDateString = () => new Date().toISOString().split('T')[0];
const getYesterdayDateString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
};

const STORAGE_KEY = '@wormind_player_state_native_v1';
const DEFAULT_START_LEVEL = 1;
const START_DEV_COINS = 100;

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('worlds');
  const [activeLevelId, setActiveLevelId] = useState<number>(DEFAULT_START_LEVEL);
  const [showRestoreStrikeModal, setShowRestoreStrikeModal] = useState<boolean>(false);
  const [showStrikeInfoModal, setShowStrikeInfoModal] = useState<boolean>(false);
  const [showRefillHeartsModal, setShowRefillHeartsModal] = useState<boolean>(false);
  const [pendingLevelToStart, setPendingLevelToStart] = useState<number | null>(null);

  const [playerState, setPlayerState] = useState<PlayerState>({
    coins: START_DEV_COINS,
    stars: 380,
    hearts: 5,
    maxHearts: 5,
    heartSeconds: 252,
    streak: 5,
    streakLvl: 2,
    streakMax: 7,
    claimedDays: [1, 2, 3, 4],
    hasClaimedDay5: false,
    hintsAvailable: 2,
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
  });

  const todayDateStr = getTodayDateString();
  const yesterdayDateStr = getYesterdayDateString();
  const hasClaimedToday = playerState.lastDailyClaimDate === todayDateStr;
  const canClaimDaily = !hasClaimedToday;
  const canSpinToday = playerState.lastSpinDate !== todayDateStr;

  // Active claimed days in current 7-day cycle
  // If user completed 7 days and a new day arrived, start a fresh 7-day cycle!
  const activeClaimedDays =
    (playerState.claimedDays || []).length >= 7 && canClaimDaily
      ? []
      : (playerState.claimedDays || []);

  const currentDailyDay = Math.min(7, (activeClaimedDays.length % 7) + 1);

  // Initialize Google Mobile Ads SDK on app startup
  useEffect(() => {
    initAdMob();
  }, []);

  // Load saved state from native AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((data) => {
      if (data) {
        try {
          const parsed = JSON.parse(data);
          const savedLevel = typeof parsed.currentLevel === 'number' && parsed.currentLevel >= 1
            ? parsed.currentLevel
            : DEFAULT_START_LEVEL;
          const savedCoins = typeof parsed.coins === 'number' && parsed.coins <= 1000 ? parsed.coins : 100;
          const savedStrike = typeof parsed.strike === 'number' ? parsed.strike : 10;
          const savedZeroFails = typeof parsed.strikeZeroFails === 'number' ? parsed.strikeZeroFails : 0;
          setPlayerState((prev) => ({
            ...prev,
            ...parsed,
            coins: savedCoins,
            currentLevel: savedLevel,
            strike: savedStrike,
            strikeZeroFails: savedZeroFails,
          }));
          setActiveLevelId(savedLevel);
          nativeAudio.setSoundEnabled(parsed.soundEnabled ?? true);
          nativeAudio.setMusicEnabled(parsed.musicEnabled ?? true);
        } catch {}
      } else {
        setActiveLevelId(DEFAULT_START_LEVEL);
      }
    });
  }, []);

  // Save state on change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(playerState)).catch(() => {});
    nativeAudio.setSoundEnabled(playerState.soundEnabled);
    nativeAudio.setMusicEnabled(playerState.musicEnabled);
  }, [playerState]);

  // Hearts refill timer
  useEffect(() => {
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
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;
  };

  const handleStartLevel = (levelId: number) => {
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
      strike: Math.max(0, (prev.strike || 0) - 50),
    }));
  };

  const handleRestoreStrike = (): boolean => {
    if (playerState.coins < 100) return false;
    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins - 100,
      strike: (prev.strike || 0) + 10,
    }));
    return true;
  };

  const handleCompleteLevel = (levelId: number, starsEarned: number, coinsEarned: number) => {
    // 🔹 Smart AdMob Interstitial Ad (Randomized Win + 3-min Time Auto-Trigger)
    showSmartInterstitialAd();

    const nextLevel = levelId < 100 ? levelId + 1 : 100;

    setPlayerState((prev) => {
      const currentHighest = prev.currentLevel || 1;
      const updatedHighest = Math.max(currentHighest, nextLevel);
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        stars: prev.stars + starsEarned,
        solvedCount: prev.solvedCount + 1,
        wordsDiscovered: prev.wordsDiscovered + 5,
        currentLevel: updatedHighest,
        strike: (prev.strike || 0) + 10, // 🔥 +10 Strike on win!
      };
    });

    setActiveLevelId((prev) => Math.max(prev, nextLevel));
    setCurrentScreen('worlds');
  };

  const handleAddCoins = (amount: number) => {
    setPlayerState((prev) => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleDeductCoins = (amount: number): boolean => {
    if (playerState.coins < amount) return false;
    setPlayerState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  };

  const handleAddHints = (amount: number) => {
    setPlayerState((prev) => ({
      ...prev,
      hintsAvailable: prev.hintsAvailable + amount,
    }));
  };

  const handleRefillHearts = () => {
    setPlayerState((prev) => ({
      ...prev,
      hearts: prev.maxHearts,
      heartSeconds: 252,
    }));
  };

  const handleClaimDaily = (day: number) => {
    const reward = DAILY_REWARDS.find((r) => r.day === day) || DAILY_REWARDS[0];
    const isConsecutive = playerState.lastDailyClaimDate === yesterdayDateStr;
    const nextStreak = isConsecutive ? (playerState.streak || 0) + 1 : 1;

    const baseClaimed = (playerState.claimedDays || []).length >= 7 ? [] : (playerState.claimedDays || []);
    const updatedClaimed = baseClaimed.includes(day) ? baseClaimed : [...baseClaimed, day];

    setPlayerState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      hintsAvailable: prev.hintsAvailable + reward.hints,
      claimedDays: updatedClaimed,
      lastDailyClaimDate: todayDateStr,
      hasClaimedDay5: updatedClaimed.includes(5),
      streak: nextStreak,
    }));
  };

  const handleRecordSpin = () => {
    setPlayerState((prev) => ({
      ...prev,
      lastSpinDate: todayDateStr,
    }));
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
      coins: 100,
      stars: 380,
      hearts: 5,
      maxHearts: 5,
      heartSeconds: 252,
      streak: 5,
      streakLvl: 2,
      streakMax: 7,
      claimedDays: [],
      hasClaimedDay5: false,
      hintsAvailable: 2,
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
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Top Persistent HUD Header */}
      <NativeHeader
        coins={playerState.coins}
        hearts={playerState.hearts}
        maxHearts={playerState.maxHearts}
        heartCountdown={formatCountdown(playerState.heartSeconds)}
        level={activeLevelId}
        strike={playerState.strike ?? 10}
        onPressStrike={() => {
          const isLocked = (playerState.strike ?? 10) <= 0 && (playerState.strikeZeroFails ?? 0) >= 2;
          if (isLocked) {
            setShowRestoreStrikeModal(true);
          } else {
            setShowStrikeInfoModal(true);
          }
        }}
        onOpenShop={() => {}}
        onRefillHearts={() => setShowRefillHeartsModal(true)}
        musicEnabled={playerState.musicEnabled}
        onToggleMusic={handleToggleMusic}
      />

      {/* Screen Views */}
      <View style={styles.screenContainer}>
        {currentScreen === 'worlds' && (
          <NativeWorldsView
            onStartLevel={handleStartLevel}
            activeLevelId={playerState.currentLevel || activeLevelId}
          />
        )}

        {currentScreen === 'game' && (
          <NativeGameView
            levelId={activeLevelId}
            onExit={() => setCurrentScreen('worlds')}
            onCompleteLevel={handleCompleteLevel}
            coins={playerState.coins}
            onDeductCoins={handleDeductCoins}
            strike={playerState.strike ?? 10}
            strikeZeroFails={playerState.strikeZeroFails ?? 0}
            onFailLevel={handleFailLevel}
            onRestoreStrike={handleRestoreStrike}
          />
        )}

        {currentScreen === 'daily' && (
          <NativeDailyView
            claimedDays={activeClaimedDays}
            canClaimToday={canClaimDaily}
            currentDayToClaim={currentDailyDay}
            streak={playerState.streak}
            onClaimDaily={handleClaimDaily}
            hasClaimedDay5={!canClaimDaily}
            onClaimDay5={() => handleClaimDaily(currentDailyDay)}
            onAddCoins={handleAddCoins}
            onAddHints={handleAddHints}
            canSpinToday={canSpinToday}
            onRecordSpin={handleRecordSpin}
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
      <AdBanner />

      {/* Bottom Floating Navigation (shown outside game view) */}
      {currentScreen !== 'game' && (
        <NativeBottomNav
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          hasClaimableDaily={canClaimDaily}
        />
      )}

      {/* Refill Hearts Modal */}
      <Modal visible={showRefillHeartsModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
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
                onPress={() => {
                  if (handleDeductCoins(50)) {
                    handleRefillHearts();
                    setShowRefillHeartsModal(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.restoreConfirmBtn,
                  { backgroundColor: '#DC2626' },
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.restoreConfirmText}>REFILL (50 🪙)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Snapchat Strike Restore Modal */}
      <Modal visible={showRestoreStrikeModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.restoreCard}>
            <View style={styles.fireHeaderCircle}>
              <MaterialIcons name="local-fire-department" size={44} color="#FF4500" />
            </View>
            <Text style={styles.restoreTitle}>0 FREE CHANCES LEFT! 🔥</Text>
            <Text style={styles.restoreSub}>
              Your strike reached 0 and you failed both 2 free chances! Restore your strike with 100 Coins to keep playing and build your flame back up!
            </Text>

            <View style={styles.restorePriceBox}>
              <Text style={styles.restorePriceLabel}>REPAIR COST:</Text>
              <View style={styles.priceRow}>
                <MaterialIcons name="monetization-on" size={24} color="#F59E0B" />
                <Text style={styles.priceText}>100 Coins</Text>
              </View>
              <Text style={styles.currentCoinsText}>
                Your Coins: {playerState.coins.toLocaleString()}
              </Text>
            </View>

            <View style={styles.restoreBtnRow}>
              <Pressable
                onPress={() => {
                  setShowRestoreStrikeModal(false);
                  setPendingLevelToStart(null);
                }}
                style={({ pressed }) => [styles.restoreCancelBtn, pressed && styles.pressed]}
              >
                <Text style={styles.restoreCancelText}>CANCEL</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (handleRestoreStrike()) {
                    setShowRestoreStrikeModal(false);
                    if (pendingLevelToStart !== null) {
                      setActiveLevelId(pendingLevelToStart);
                      setCurrentScreen('game');
                      setPendingLevelToStart(null);
                    }
                  }
                }}
                style={({ pressed }) => [styles.restoreConfirmBtn, pressed && styles.pressed]}
              >
                <Text style={styles.restoreConfirmText}>RESTORE (100 🪙)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Word Strike Info Modal */}
      <CustomAlert
        visible={showStrikeInfoModal}
        title="WORD STRIKE"
        message={`Current Strike: ${playerState.strike ?? 10}!\n\n• Each level win gives +10 Strike!\n• Failing a level loses -50 Strike.\n• If Strike hits 0, restore it for 100 Coins!`}
        icon="local-fire-department"
        btnText="GOT IT"
        onClose={() => setShowStrikeInfoModal(false)}
      />
    </SafeAreaView>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  screenContainer: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 11, 46, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
});
