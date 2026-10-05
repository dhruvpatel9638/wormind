import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
  Alert,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TargetWord } from '../../types';
import { INITIAL_LEVELS } from '../../data/gameData';
import { nativeAudio } from '../audio';
import { CustomAlert } from '../components/CustomAlert';
import { showRewardedAd } from '../../utils/admobService';

interface GameViewProps {
  levelId: number;
  onExit: () => void;
  onCompleteLevel: (levelId: number, stars: number, coinsEarned: number) => void;
  coins: number;
  onDeductCoins: (amount: number) => boolean;
  strike?: number;
  onFailLevel?: () => void;
  onRestoreStrike?: () => boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = Math.min(SCREEN_WIDTH - 28, 380);
const TILE_SIZE = GRID_SIZE / 8;

export const NativeGameView: React.FC<GameViewProps> = ({
  levelId,
  onExit,
  onCompleteLevel,
  coins,
  onDeductCoins,
  strike = 10,
  onFailLevel,
  onRestoreStrike,
}) => {
  const currentLevel =
    INITIAL_LEVELS.find((l) => l.id === levelId) ||
    INITIAL_LEVELS.find((l) => l.id === 4) ||
    INITIAL_LEVELS[0];

  const [grid, setGrid] = useState<string[][]>(currentLevel.grid);
  // Ensure all target words start as unfound when playing
  const [targetWords, setTargetWords] = useState<TargetWord[]>(() =>
    currentLevel.targetWords.map((tw) => ({ ...tw, found: false }))
  );
  // Stores { r, c } cells that belong to found words
  const [solvedCells, setSolvedCells] = useState<{ r: number; c: number }[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [spelledWord, setSpelledWord] = useState<string>('');
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [hintedCells, setHintedCells] = useState<{ r: number; c: number }[]>([]);
  const [isScrollingEnabled, setIsScrollingEnabled] = useState<boolean>(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;

  const lossScaleAnim = useRef(new Animated.Value(0)).current;
  const lossHeartAnim = useRef(new Animated.Value(0)).current;
  const lossStrikeAnim = useRef(new Animated.Value(0)).current;
  const lossShakeAnim = useRef(new Animated.Value(0)).current;
  const floatMinusOneAnim = useRef(new Animated.Value(0)).current;
  const floatMinusOneY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVictory) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.spring(star1Anim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
        Animated.spring(star2Anim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
        Animated.spring(star3Anim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      star1Anim.setValue(0);
      star2Anim.setValue(0);
      star3Anim.setValue(0);
    }
  }, [isVictory]);

  useEffect(() => {
    if (isGameOver) {
      lossScaleAnim.setValue(0);
      lossHeartAnim.setValue(0);
      lossStrikeAnim.setValue(0);
      lossShakeAnim.setValue(0);
      floatMinusOneAnim.setValue(0);
      floatMinusOneY.setValue(0);

      Animated.sequence([
        Animated.spring(lossScaleAnim, { toValue: 1, friction: 5, tension: 60, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(lossShakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
          Animated.timing(lossShakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
          Animated.timing(lossShakeAnim, { toValue: -8, duration: 40, useNativeDriver: true }),
          Animated.timing(lossShakeAnim, { toValue: 8, duration: 40, useNativeDriver: true }),
          Animated.timing(lossShakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(lossHeartAnim, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
          Animated.spring(lossStrikeAnim, { toValue: 1, friction: 4, tension: 70, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(floatMinusOneAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(floatMinusOneY, { toValue: -32, duration: 700, useNativeDriver: true }),
        ]),
      ]).start();
    } else {
      lossScaleAnim.setValue(0);
      lossHeartAnim.setValue(0);
      lossStrikeAnim.setValue(0);
      lossShakeAnim.setValue(0);
      floatMinusOneAnim.setValue(0);
      floatMinusOneY.setValue(0);
    }
  }, [isGameOver]);

  // Pause BGM when entering GameView, resume when exiting
  useEffect(() => {
    nativeAudio.setInGame(true);
    return () => {
      nativeAudio.setInGame(false);
    };
  }, []);

  const [lastFoundMessage, setLastFoundMessage] = useState<string | null>(null);

  // 🔥 STREAK STATE & ANIMATION REFS
  const [wordStreak, setWordStreak] = useState<number>(0);
  const [maxWordStreak, setMaxWordStreak] = useState<number>(0);

  const streakScaleAnim = useRef(new Animated.Value(1)).current;
  const streakRotateAnim = useRef(new Animated.Value(0)).current;
  const iconScaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const ringScaleAnim = useRef(new Animated.Value(1)).current;
  const ringOpacityAnim = useRef(new Animated.Value(0)).current;
  const activeStreakPulse = useRef(new Animated.Value(1)).current;

  // 6 Radial flame particles
  const particleAnims = useRef(
    [0, 60, 120, 180, 240, 300].map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.5),
    }))
  ).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const triggerStreakAnimation = (currentStreak: number) => {
    streakScaleAnim.setValue(1);
    Animated.sequence([
      Animated.spring(streakScaleAnim, { toValue: 1.35, friction: 3, tension: 60, useNativeDriver: true }),
      Animated.spring(streakScaleAnim, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }),
    ]).start();

    particleAnims.forEach((p, idx) => {
      const angle = (idx * 60 * Math.PI) / 180;
      const distance = 24;
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(p.x, { toValue: Math.cos(angle) * distance, duration: 400, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: Math.sin(angle) * distance, duration: 400, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(p.scale, { toValue: 1.2, duration: 400, useNativeDriver: true }),
      ]).start();
    });
  };

  const triggerStreakReset = () => {
    setWordStreak(0);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const timerTheme = timeLeft <= 15
    ? { bg: '#FEE2E2', border: '#EF4444', text: '#DC2626' }
    : timeLeft <= 30
    ? { bg: '#FEF3C7', border: '#F59E0B', text: '#B45309' }
    : { bg: '#F0EAFF', border: 'rgba(40, 107, 234, 0.25)', text: '#7652D9' };

  const getStreakStyle = (s: number) => {
    if (s >= 5) return { bg: '#FEF3C7', border: '#F59E0B', icon: '#D97706', text: '#B45309' };
    if (s >= 3) return { bg: '#FFEDD5', border: '#FB923C', icon: '#EA580C', text: '#C2410C' };
    if (s >= 1) return { bg: '#FEF2F2', border: '#FCA5A5', icon: '#EF4444', text: '#B91C1C' };
    return { bg: '#F3F4F6', border: '#E5E7EB', icon: '#9CA3AF', text: '#6B7280' };
  };
  const streakStyle = getStreakStyle(wordStreak);

  // Persistent flame pulse effect when wordStreak >= 2
  useEffect(() => {
    if (wordStreak < 2 || isPaused || isVictory || isGameOver) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(activeStreakPulse, { toValue: 1.08, duration: 400, useNativeDriver: true }),
        Animated.timing(activeStreakPulse, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [wordStreak, isPaused, isVictory, isGameOver, activeStreakPulse]);

  const onFailLevelRef = useRef(onFailLevel);
  useEffect(() => {
    onFailLevelRef.current = onFailLevel;
  }, [onFailLevel]);

  // Level Countdown Timer (120 seconds)
  useEffect(() => {
    if (isPaused || isVictory || isGameOver) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGameOver(true);
          nativeAudio.playGameOver();
          if (onFailLevelRef.current) onFailLevelRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isVictory, isGameOver]);

  // Pulse timer badge on tick & urgent pulse when low time (<= 30s)
  useEffect(() => {
    if (isPaused || isVictory || isGameOver) return;
    pulseAnim.setValue(1);
    if (timeLeft <= 30 && timeLeft > 0) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.18, duration: 180, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft, isPaused, isVictory, isGameOver, pulseAnim]);

  const resetLevelState = useCallback((lvl: typeof currentLevel) => {
    setGrid(lvl.grid);
    setTargetWords(lvl.targetWords.map((tw) => ({ ...tw, found: false })));
    setSolvedCells([]);
    setSelectedCells([]);
    setSpelledWord('');
    setIsVictory(false);
    setIsPaused(false);
    setIsGameOver(false);
    setTimeLeft(120);
    setHintedCells([]);
    setLastFoundMessage(null);
  }, [levelId]);

  useEffect(() => {
    resetLevelState(currentLevel);
  }, [levelId]);

  const foundCount = targetWords.filter((w) => w.found).length;
  const totalCount = targetWords.length;

  // Check if given cells spell any unfound target word
  const checkSelection = useCallback(
    (cells: { r: number; c: number }[]): boolean => {
      if (cells.length < 2) return false;
      const letters = cells.map((cell) => grid[cell.r]?.[cell.c] || '').join('');
      const reversed = letters.split('').reverse().join('');

      const matchIdx = targetWords.findIndex(
        (tw) => !tw.found && (tw.word === letters || tw.word === reversed)
      );

      if (matchIdx !== -1) {
        const matched = targetWords[matchIdx];
        nativeAudio.playWordFound();

        // Increment Streak & trigger streak animation
        setWordStreak((prev) => {
          const next = prev + 1;
          setMaxWordStreak((m) => Math.max(m, next));
          triggerStreakAnimation(next);
          return next;
        });

        // Update targetWords
        const updatedWords = [...targetWords];
        updatedWords[matchIdx] = { ...matched, found: true };
        setTargetWords(updatedWords);

        // Add newly found cells to solvedCells
        setSolvedCells((prev) => {
          const newSet = [...prev];
          cells.forEach((c) => {
            if (!newSet.some((existing) => existing.r === c.r && existing.c === c.c)) {
              newSet.push(c);
            }
          });
          return newSet;
        });

        // Flash banner
        setLastFoundMessage(`✨ FOUND: ${matched.word}!`);
        setTimeout(() => setLastFoundMessage(null), 2000);

        setSelectedCells([]);
        setSpelledWord('');

        // Check if all found
        if (updatedWords.every((w) => w.found)) {
          setTimeout(() => {
            setIsVictory(true);
            nativeAudio.playVictory();
          }, 450);
        }
        return true;
      }
      return false;
    },
    [grid, targetWords]
  );

  // Fix stale closures in PanResponder by using a ref for current state values
  const gameStateRef = useRef({ isPaused, isVictory, isGameOver, grid, checkSelection });
  
  useEffect(() => {
    gameStateRef.current = { isPaused, isVictory, isGameOver, grid, checkSelection };
  }, [isPaused, isVictory, isGameOver, grid, checkSelection]);

  // PanResponder for smooth drag / swipe selection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        setIsScrollingEnabled(false);
        const state = gameStateRef.current;
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        const { locationX, locationY } = evt.nativeEvent;
        const c = Math.floor(locationX / TILE_SIZE);
        const r = Math.floor(locationY / TILE_SIZE);
        if (r >= 0 && r < 8 && c >= 0 && c < 8 && state.grid[r]?.[c] && state.grid[r][c] !== ' ') {
          setSelectedCells([{ r, c }]);
          setSpelledWord(state.grid[r][c]);
          nativeAudio.playLetterTap(1);
        }
      },
      onPanResponderMove: (evt) => {
        const state = gameStateRef.current;
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        const { locationX, locationY } = evt.nativeEvent;
        const c = Math.floor(locationX / TILE_SIZE);
        const r = Math.floor(locationY / TILE_SIZE);

        if (r >= 0 && r < 8 && c >= 0 && c < 8 && state.grid[r]?.[c] && state.grid[r][c] !== ' ') {
          setSelectedCells((prev) => {
            if (prev.length === 0) return [{ r, c }];
            const startCell = prev[0];
            
            if (startCell.r === r && startCell.c === c) return [startCell];

            const dr = r - startCell.r;
            const dc = c - startCell.c;

            // Must be a straight line (horizontal, vertical, or perfectly diagonal)
            if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) {
              return prev; // Not a valid line, ignore
            }

            const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
            const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
            const len = Math.max(Math.abs(dr), Math.abs(dc));

            const updated = [];
            for (let i = 0; i <= len; i++) {
              updated.push({
                r: startCell.r + i * stepR,
                c: startCell.c + i * stepC
              });
            }

            // Avoid unnecessary state updates
            if (updated.length === prev.length && updated[updated.length - 1].r === prev[prev.length - 1].r && updated[updated.length - 1].c === prev[prev.length - 1].c) {
              return prev;
            }

            const word = updated.map((cell) => state.grid[cell.r][cell.c]).join('');
            setSpelledWord(word);
            
            if (updated.length !== prev.length) {
              nativeAudio.playLetterTap(updated.length);
            }
            return updated;
          });
        }
      },
      onPanResponderRelease: () => {
        setIsScrollingEnabled(true);
        const state = gameStateRef.current;
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        setSelectedCells((current) => {
          const solved = state.checkSelection(current);
          if (!solved) {
            setSpelledWord('');
            if (current.length >= 2) {
              triggerStreakReset();
            }
          }
          return [];
        });
      },
      onPanResponderTerminate: () => {
        setIsScrollingEnabled(true);
        setSelectedCells([]);
        setSpelledWord('');
      },
    })
  ).current;

  // Tap-to-select support (tap letters one by one)
  const handleTileClick = (r: number, c: number) => {
    if (isPaused || isVictory || isGameOver) return;
    if (!grid[r]?.[c] || grid[r][c] === ' ') return;

    const existingIdx = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);

    if (existingIdx !== -1) {
      // Deselect tile
      const newSelection = selectedCells.filter((_, idx) => idx !== existingIdx);
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord);
      nativeAudio.playLetterTap(newSelection.length);
    } else {
      // Add tile
      const newSelection = [...selectedCells, { r, c }];
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord);
      nativeAudio.playLetterTap(newSelection.length);

      // Check if this tap completes a target word
      checkSelection(newSelection);
    }
  };

  const handleClear = () => {
    if (selectedCells.length >= 2) {
      triggerStreakReset();
    }
    setSelectedCells([]);
    setSpelledWord('');
  };

  // Power-up: Shuffle (clears board selection)
  const handleShuffle = () => {
    nativeAudio.playLetterTap(1);
    setSelectedCells([]);
    setSpelledWord('');
  };

  // Power-up: Hint (25 Coins)
  const handleHint = () => {
    const unfound = targetWords.find((tw) => !tw.found);
    if (!unfound) return;

    if (coins < 25) {
      setAlertInfo({ title: 'Coins Needed', message: 'You need 25 coins for a Hint!' });
      return;
    }

    if (!onDeductCoins(25)) return;

    nativeAudio.playSparkle();
    setHintedCells([{ r: unfound.rowStart, c: unfound.colStart }]);
    setTimeout(() => setHintedCells([]), 3500);
  };

  // Rewarded Ad: Free Hint by watching Ad
  const handleRewardedHint = () => {
    const unfound = targetWords.find((tw) => !tw.found);
    if (!unfound) {
      setAlertInfo({ title: 'No Words Left', message: 'All words are already found!' });
      return;
    }

    showRewardedAd(() => {
      setAlertInfo({
        title: '🎁 Free Hint Unlocked!',
        message: 'You watched an ad! Tap GOT IT to show your free hint on the grid.',
        onConfirm: () => {
          nativeAudio.playSparkle();
          setHintedCells([{ r: unfound.rowStart, c: unfound.colStart }]);
          setTimeout(() => setHintedCells([]), 3500);
        },
      });
    });
  };

  // Power-up: Reveal (50 Coins)
  const handleReveal = () => {
    const unfoundIdx = targetWords.findIndex((tw) => !tw.found);
    if (unfoundIdx === -1) return;

    if (coins < 50) {
      setAlertInfo({ title: 'Coins Needed', message: 'You need 50 coins to Reveal a word!' });
      return;
    }

    if (!onDeductCoins(50)) return;

    nativeAudio.playWordFound();
    const unfoundWord = targetWords[unfoundIdx];
    const newTargetWords = [...targetWords];
    newTargetWords[unfoundIdx] = { ...unfoundWord, found: true };
    setTargetWords(newTargetWords);

    // Add its cells to solvedCells
    const minR = Math.min(unfoundWord.rowStart, unfoundWord.rowEnd);
    const maxR = Math.max(unfoundWord.rowStart, unfoundWord.rowEnd);
    const minC = Math.min(unfoundWord.colStart, unfoundWord.colEnd);
    const maxC = Math.max(unfoundWord.colStart, unfoundWord.colEnd);
    const rStep = unfoundWord.rowEnd === unfoundWord.rowStart ? 0 : unfoundWord.rowEnd > unfoundWord.rowStart ? 1 : -1;
    const cStep = unfoundWord.colEnd === unfoundWord.colStart ? 0 : unfoundWord.colEnd > unfoundWord.colStart ? 1 : -1;
    const len = Math.max(maxR - minR, maxC - minC);

    setSolvedCells((prev) => {
      const copy = [...prev];
      for (let i = 0; i <= len; i++) {
        const r = unfoundWord.rowStart + i * rStep;
        const c = unfoundWord.colStart + i * cStep;
        if (!copy.some((existing) => existing.r === r && existing.c === c)) {
          copy.push({ r, c });
        }
      }
      return copy;
    });

    setLastFoundMessage(`✨ REVEALED: ${unfoundWord.word}!`);
    setTimeout(() => setLastFoundMessage(null), 2000);

    if (newTargetWords.every((w) => w.found)) {
      setTimeout(() => {
        setIsVictory(true);
        nativeAudio.playVictory();
      }, 450);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>


      {/* Target Words Drawer */}
      <View style={styles.wordsCard}>
        <View style={styles.wordsHeader}>
          <View style={styles.wordsTitleRow}>
            <MaterialIcons name="search" size={16} color="#4D8AFF" />
            <Text style={styles.wordsTitle}>WORDS TO FIND</Text>
          </View>
          <View style={styles.foundBadge}>
            <Text style={styles.foundBadgeText}>{foundCount} / {totalCount} FOUND</Text>
          </View>
        </View>

        <View style={styles.pillsRow}>
          {targetWords.map((tw) => {
            const isFound = tw.found;
            return (
              <View
                key={tw.word}
                style={[styles.wordPill, isFound ? styles.pillFound : styles.pillNormal]}
              >
                {isFound && (
                  <MaterialIcons name="check-circle" size={14} color="#35C94A" style={{ marginRight: 3 }} />
                )}
                <Text style={[styles.pillText, isFound ? styles.pillTextFound : styles.pillTextNormal]}>
                  {tw.word}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Spelled Word Active Banner */}
      <View style={styles.spellingBar}>
        <View style={styles.spellingLeft}>
          <Text style={styles.spellingLabel}>SPELLING:</Text>
          {spelledWord ? (
            <Text style={styles.spelledActive}>{spelledWord}</Text>
          ) : lastFoundMessage ? (
            <Text style={styles.foundAlertText}>{lastFoundMessage}</Text>
          ) : (
            <Text style={styles.spelledPlaceholder}>Swipe or tap letters on grid...</Text>
          )}
        </View>

        {spelledWord !== '' ? (
          <Pressable onPress={handleClear} style={styles.clearBtn}>
            <MaterialIcons name="close" size={16} color="#FFFFFF" />
          </Pressable>
        ) : (
          <View style={{ width: 24, height: 24 }} />
        )}
      </View>

      {/* Timer & Streak Row (Below Spelling Bar) */}
      <View style={styles.timerControlRow}>
        <View style={styles.timerStreakGroup}>
          <Animated.View
            style={[
              styles.timerBadge,
              {
                backgroundColor: timerTheme.bg,
                borderColor: timerTheme.border,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <MaterialIcons name="timer" size={18} color={timerTheme.text} />
            <Text style={[styles.timerText, { color: timerTheme.text }]}>
              {formatTime(timeLeft)}
            </Text>
          </Animated.View>

          {/* 🔥 STREAK BADGE (Right next to Time!) */}
          <View style={styles.streakWrapper}>
            {/* Shockwave Aura Burst Ring */}
            <Animated.View
              style={[
                styles.shockwaveRing,
                {
                  borderColor: streakStyle.icon,
                  opacity: ringOpacityAnim,
                  transform: [{ scale: ringScaleAnim }],
                },
              ]}
            />

            <Animated.View
              style={[
                styles.streakBadge,
                {
                  backgroundColor: streakStyle.bg,
                  borderColor: streakStyle.border,
                  transform: [
                    { scale: Animated.multiply(streakScaleAnim, activeStreakPulse) },
                    {
                      rotate: streakRotateAnim.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ['-14deg', '0deg', '14deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Animated Flame Icon */}
              <Animated.View
                style={{
                  transform: [
                    { scale: iconScaleAnim },
                    {
                      rotate: iconRotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                }}
              >
                <MaterialIcons
                  name={wordStreak >= 4 ? 'local-fire-department' : 'whatshot'}
                  size={20}
                  color={streakStyle.icon}
                />
              </Animated.View>

              <Text style={[styles.streakText, { color: streakStyle.text }]}>
                {wordStreak > 0 ? `${wordStreak}x` : '0x'}
              </Text>
            </Animated.View>

            {/* 6 Radial Flame Particles Bursting directly from Icon */}
            {particleAnims.map((p, idx) => (
              <Animated.View
                key={`particle-${idx}`}
                pointerEvents="none"
                style={[
                  styles.fireParticle,
                  {
                    opacity: p.opacity,
                    transform: [
                      { translateX: p.x },
                      { translateY: p.y },
                      { scale: p.scale },
                    ],
                  },
                ]}
              >
                <MaterialIcons name="whatshot" size={13} color={streakStyle.icon} />
              </Animated.View>
            ))}
          </View>
        </View>

        <Pressable
          onPress={() => setIsPaused(true)}
          style={({ pressed }) => [styles.pauseBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="pause" size={20} color="#172858" />
        </Pressable>
      </View>



      {/* 8x8 Interactive Word Search Matrix (0-Gap Flat Square Matrix) with Drag & Tap */}
      <View
        style={[styles.matrixCard, { width: GRID_SIZE, height: GRID_SIZE }]}
      >
        <View
          {...panResponder.panHandlers}
          style={[styles.gridContainer, { width: GRID_SIZE, height: GRID_SIZE }]}
        >
          {grid.map((row, r) => (
            <View key={`row-${r}`} style={styles.gridRow} pointerEvents="none">
              {row.map((letter, c) => {
                const isSolved = solvedCells.some((cell) => cell.r === r && cell.c === c);
                const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);
                const isHinted = hintedCells.some((cell) => cell.r === r && cell.c === c);
                const isEmpty = letter === ' ';

                if (isEmpty) {
                  return (
                    <View
                      key={`${r}-${c}`}
                      style={[
                        styles.tile,
                        {
                          width: TILE_SIZE,
                          height: TILE_SIZE,
                          backgroundColor: 'transparent',
                        },
                      ]}
                    />
                  );
                }

                let tileBg = '#FFFFFF';
                let tileColor = '#2E1065';

                if (isSolved) {
                  tileBg = '#CCFBF1'; // Teal solved
                  tileColor = '#0F766E';
                } else if (isSelected) {
                  tileBg = '#EDE9FE'; // Violet selected
                  tileColor = '#6D28D9';
                } else if (isHinted) {
                  tileBg = '#FEF3C7'; // Gold hinted
                  tileColor = '#B45309';
                }

                return (
                  <View
                    key={`${r}-${c}`}
                    style={[
                      styles.tile,
                      {
                        width: TILE_SIZE - 4,
                        height: TILE_SIZE - 4,
                        margin: 2,
                        backgroundColor: tileBg,
                        borderRadius: 10,
                        elevation: 3,
                        shadowColor: '#0E1A3A',
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: 0.1,
                        shadowRadius: 3,
                      },
                    ]}
                  >
                    <Text style={[styles.tileLetter, { color: tileColor }]}>
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* 3 Action Power-up Buttons */}
      <View style={styles.actionRow}>
        {/* Shuffle */}
        <Pressable
          onPress={handleShuffle}
          style={({ pressed }) => [styles.actionBtn, styles.shuffleBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="refresh" size={20} color="#7C3AED" />
          <Text style={[styles.actionBtnTitle, { color: '#7C3AED' }]}>CLEAR</Text>
          <Text style={[styles.actionBtnSub, { color: '#7C3AED' }]}>Free</Text>
        </Pressable>

        {/* Hint */}
        <Pressable
          onPress={handleHint}
          style={({ pressed }) => [styles.actionBtn, styles.hintBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="lightbulb" size={20} color="#B45309" />
          <Text style={[styles.actionBtnTitle, { color: '#B45309' }]}>HINT</Text>
          <Text style={[styles.actionBtnSub, { color: '#B45309' }]}>🪙 25</Text>
        </Pressable>

        {/* Free Hint (Rewarded Ad) */}
        <Pressable
          onPress={handleRewardedHint}
          style={({ pressed }) => [styles.actionBtn, { backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }, pressed && styles.pressed]}
        >
          <MaterialIcons name="ondemand-video" size={20} color="#0284C7" />
          <Text style={[styles.actionBtnTitle, { color: '#0284C7' }]}>FREE HINT</Text>
          <Text style={[styles.actionBtnSub, { color: '#0284C7' }]}>🎬 Watch Ad</Text>
        </Pressable>

        {/* Reveal */}
        <Pressable
          onPress={handleReveal}
          style={({ pressed }) => [styles.actionBtn, styles.revealBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="auto-fix-high" size={20} color="#0D9488" />
          <Text style={[styles.actionBtnTitle, { color: '#0D9488' }]}>REVEAL</Text>
          <Text style={[styles.actionBtnSub, { color: '#0D9488' }]}>🪙 50</Text>
        </Pressable>
      </View>

      {/* Level Victory Modal */}
      <Modal visible={isVictory} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View style={[styles.victoryCard, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.trophyCircle}>
              <MaterialIcons name="emoji-events" size={40} color="#5A3800" />
            </View>
            <Text style={styles.victoryTitle}>LEVEL COMPLETE!</Text>
            <Text style={styles.victorySubtitle}>You solved all words in Level {levelId}!</Text>

            {maxWordStreak > 0 && (
              <View style={styles.streakVictoryBadge}>
                <MaterialIcons name="whatshot" size={16} color="#FF6B00" />
                <Text style={styles.streakVictoryText}>BEST STREAK: {maxWordStreak}x</Text>
              </View>
            )}

            <View style={styles.starsRow}>
              <MaterialIcons name="star" size={36} color="#FFC928" />
              <MaterialIcons name="star" size={42} color="#FFC928" />
              <MaterialIcons name="star" size={36} color="#FFC928" />
            </View>

            <View style={styles.rewardRow}>
              <View style={styles.rewardBox}>
                <MaterialIcons name="monetization-on" size={22} color="#FFC928" />
                <Text style={styles.rewardValue}>+50</Text>
                <Text style={styles.rewardLabel}>Coins</Text>
              </View>
              <View style={[styles.rewardBox, { borderColor: '#FDBA74', backgroundColor: '#FFF7ED' }]}>
                <MaterialIcons name="local-fire-department" size={22} color="#FF4500" />
                <Text style={[styles.rewardValue, { color: '#EA580C' }]}>+10</Text>
                <Text style={[styles.rewardLabel, { color: '#C2410C' }]}>Strike 🔥</Text>
              </View>
              <View style={styles.rewardBox}>
                <MaterialIcons name="military-tech" size={22} color="#7C3AED" />
                <Text style={styles.rewardValue}>+100</Text>
                <Text style={styles.rewardLabel}>XP</Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                nativeAudio.stopVictory();
                onCompleteLevel(levelId, 3, 50);
              }}
              style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
            >
              <Text style={styles.continueBtnText}>NEXT LEVEL</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      {/* Pause Modal */}
      <Modal visible={isPaused} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.pauseCard}>
            <Text style={styles.pauseTitle}>GAME PAUSED</Text>
            <Text style={styles.pauseSub}>Level {levelId} • {currentLevel.title}</Text>

            <Pressable
              onPress={() => setIsPaused(false)}
              style={({ pressed }) => [styles.resumeBtn, pressed && styles.pressed]}
            >
              <Text style={styles.resumeBtnText}>RESUME</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsPaused(false);
                onExit();
              }}
              style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]}
            >
              <Text style={styles.exitBtnText}>EXIT TO MAP</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Game Over Time-Out Modal */}
      <Modal visible={isGameOver} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <Animated.View
            style={[
              styles.pauseCard,
              {
                borderColor: '#EF4444',
                transform: [
                  { scale: lossScaleAnim },
                  { translateX: lossShakeAnim },
                ],
              },
            ]}
          >
            <View style={styles.lossCircleHeader}>
              <MaterialIcons name="heart-broken" size={38} color="#EF4444" />
            </View>
            <Text style={[styles.pauseTitle, { color: '#EF4444' }]}>TIME'S UP! ⏰</Text>
            <Text style={styles.pauseSub}>Level {levelId} Failed</Text>

            {/* Loss Animations: -1 Heart & Strike Reset */}
            <View style={styles.lossBadgeContainer}>
              {/* -1 Heart Box */}
              <Animated.View
                style={[
                  styles.lossBadgeBox,
                  {
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FCA5A5',
                    transform: [
                      { scale: lossHeartAnim },
                      {
                        translateY: lossHeartAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {/* Floating "-1" animation */}
                <Animated.View
                  style={[
                    styles.floatingMinusBadge,
                    {
                      opacity: floatMinusOneAnim.interpolate({
                        inputRange: [0, 0.2, 0.8, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [{ translateY: floatMinusOneY }],
                    },
                  ]}
                >
                  <Text style={styles.floatingMinusText}>-1 ❤️</Text>
                </Animated.View>

                <MaterialIcons name="favorite" size={26} color="#DC2626" />
                <Text style={styles.lossBadgeValue}>-1 Heart</Text>
                <Text style={styles.lossBadgeLabel}>LIFE MINUS</Text>
              </Animated.View>

              {/* Strike Reset Box */}
              <Animated.View
                style={[
                  styles.lossBadgeBox,
                  {
                    backgroundColor: '#FFF7ED',
                    borderColor: '#FDBA74',
                    transform: [
                      { scale: lossStrikeAnim },
                      {
                        translateY: lossStrikeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [14, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <MaterialIcons name="whatshot" size={26} color="#EA580C" />
                <Text style={[styles.lossBadgeValue, { color: '#EA580C' }]}>Reset 🔥</Text>
                <Text style={[styles.lossBadgeLabel, { color: '#C2410C' }]}>STRIKE MINUS</Text>
              </Animated.View>
            </View>

            <Pressable
              onPress={() => {
                resetLevelState(currentLevel);
              }}
              style={({ pressed }) => [styles.resumeBtn, { backgroundColor: '#EF4444' }, pressed && styles.pressed]}
            >
              <Text style={styles.resumeBtnText}>TRY AGAIN</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setIsGameOver(false);
                onExit();
              }}
              style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]}
            >
              <Text style={styles.exitBtnText}>EXIT TO MAP</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <CustomAlert 
        visible={!!alertInfo}
        title={alertInfo?.title || ''}
        message={alertInfo?.message || ''}
        onClose={() => {
          const onConfirm = alertInfo?.onConfirm;
          setAlertInfo(null);
          if (onConfirm) {
            onConfirm();
          }
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  timerStreakGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shockwaveRing: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 4,
  },
  streakText: {
    fontWeight: '900',
    fontSize: 13,
  },
  fireParticle: {
    position: 'absolute',
  },
  streakVictoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 6,
  },
  streakVictoryText: {
    color: '#EA580C',
    fontWeight: '900',
    fontSize: 12,
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#FAF8FF',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 110,
  },
  timerControlRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EAFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(40, 107, 234, 0.25)',
    gap: 4,
  },

  topNav: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(40, 107, 234, 0.25)',
    gap: 4,
  },
  backBtnText: {
    color: '#286BEA',
    fontWeight: '800',
    fontSize: 12,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFE066',
    gap: 4,
  },
  levelBadgeText: {
    color: '#172858',
    fontWeight: '900',
    fontSize: 13,
  },
  levelBadgeSub: {
    color: '#64748B',
    fontWeight: '600',
    fontSize: 12,
  },
  timerText: {
    color: '#7652D9',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  timerTextWarning: {
    color: '#EF3B3B',
  },
  pauseBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(124, 58, 237, 0.25)',
    padding: 10,
    marginBottom: 8,
  },
  wordsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  wordsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wordsTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#286BEA',
    letterSpacing: 0.5,
  },
  foundBadge: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  foundBadgeText: {
    color: '#0F766E',
    fontWeight: '800',
    fontSize: 10,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  wordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pillNormal: {
    backgroundColor: '#FAF8FF',
    borderWidth: 1.5,
    borderColor: '#DDD6FE',
  },
  pillFound: {
    backgroundColor: '#CCFBF1',
    borderWidth: 1.5,
    borderColor: '#14B8A6',
  },
  pillText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  pillTextNormal: {
    color: '#4B5563',
  },
  pillTextFound: {
    color: '#0F766E',
    textDecorationLine: 'line-through',
  },
  spellingBar: {
    width: '100%',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  spellingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  spellingLabel: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: '900',
  },
  spelledActive: {
    color: '#7C3AED',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3,
  },
  foundAlertText: {
    color: '#0D9488',
    fontSize: 13,
    fontWeight: '900',
  },
  spelledPlaceholder: {
    color: '#9B8EC0',
    fontSize: 11,
    fontStyle: 'italic',
  },
  clearBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matrixCard: {
    backgroundColor: 'transparent',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  gridContainer: {
    backgroundColor: 'transparent',
  },
  gridRow: {
    flexDirection: 'row',
  },
  tile: {
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLetter: {
    fontSize: 24,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  shuffleBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 2,
    borderColor: '#DDD6FE',
  },
  hintBtn: {
    backgroundColor: '#FFF8E1',
    borderWidth: 2,
    borderColor: '#FDE68A',
  },
  revealBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#99F6E4',
  },
  actionBtnTitle: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  actionBtnSub: {
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 18, 42, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  victoryCard: {
    width: 290,
    backgroundColor: '#2E1065',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#FFC928',
    alignItems: 'center',
    padding: 24,
    elevation: 12,
  },
  trophyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFC928',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    marginTop: -48,
  },
  victoryTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  victorySubtitle: {
    color: '#DDD6FE',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 14,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
    marginBottom: 16,
  },
  rewardBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  rewardValue: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
    marginTop: 2,
  },
  rewardLabel: {
    color: '#DDD6FE',
    fontSize: 10,
    fontWeight: '700',
  },
  continueBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#7C3AED',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 15,
  },
  gameOverCard: {
    width: 280,
    backgroundColor: '#172858',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EF3B3B',
    alignItems: 'center',
    padding: 20,
  },
  timerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(239, 59, 59, 0.15)',
    borderWidth: 2,
    borderColor: '#EF3B3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gameOverTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  gameOverSubtitle: {
    color: '#B0C2E8',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFC928',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  retryBtnText: {
    color: '#172858',
    fontWeight: '900',
    fontSize: 14,
  },
  pauseCard: {
    width: 270,
    backgroundColor: '#2E1065',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    padding: 20,
  },
  pauseTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  pauseSub: {
    color: '#DDD6FE',
    fontSize: 11,
    marginTop: 2,
    marginBottom: 16,
  },
  resumeBtn: {
    width: '100%',
    height: 42,
    backgroundColor: '#7C3AED',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  resumeBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  exitBtn: {
    width: '100%',
    height: 38,
    backgroundColor: '#3B1A66',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitBtnText: {
    color: '#EF3B3B',
    fontWeight: '800',
    fontSize: 13,
  },
  lossBadgeContainer: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginVertical: 12,
  },
  lossBadgeBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lossBadgeValue: {
    color: '#EF4444',
    fontWeight: '900',
    fontSize: 15,
    marginTop: 2,
  },
  lossBadgeLabel: {
    color: '#991B1B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  lossCircleHeader: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: -10,
  },
  floatingMinusBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  floatingMinusText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
  },
});

