import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  useWindowDimensions,
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
import { VictoryModal } from '../components/VictoryModal';
import { showRewardedAd } from '../../utils/admobService';
import { STRIKE_LOSS_PENALTY, STRIKE_WIN_REWARD } from '../../config/strike';
import { HINT_COST, REVEAL_COST } from '../../config/economy';

interface GameViewProps {
  levelId: number;
  onExit: () => void;
  onCompleteLevel: (levelId: number, stars: number, coinsEarned: number, target?: 'next' | 'map') => void;
  coins: number;
  onDeductCoins: (amount: number) => boolean;
  onUseHint: () => boolean;
  strike?: number;
  strikeZeroFails?: number;
  onFailLevel?: () => void;
  onRestoreStrike?: (onSuccess?: () => void) => void;
  isRestoringStrike?: boolean;
}

export const NativeGameView: React.FC<GameViewProps> = ({
  levelId,
  onExit,
  onCompleteLevel,
  coins,
  onDeductCoins,
  onUseHint,
  strike = 10,
  strikeZeroFails = 0,
  onFailLevel,
  onRestoreStrike,
  isRestoringStrike = false,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const compactLayout = windowWidth <= 360;
  const gridSize = Math.max(
    232,
    Math.min(windowWidth - 28, 380, windowHeight <= 700 ? windowHeight * 0.43 : 380)
  );
  const tileSize = gridSize / 8;
  const tileSizeRef = useRef(tileSize);
  tileSizeRef.current = tileSize;
  const contentWidthStyle = { width: '100%' as const, maxWidth: 600 };
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
  // Gesture events can arrive before React renders the previous selection.
  const dragSelectionRef = useRef<{ r: number; c: number }[]>([]);
  const dragActiveRef = useRef(false);
  const [spelledWord, setSpelledWord] = useState<string>('');
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const attemptStatusRef = useRef<'playing' | 'won' | 'lost' | 'exited'>('playing');
  const completionClaimedRef = useRef(false);
  const pausedRef = useRef(false);
  const mountedRef = useRef(true);
  const victoryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [strikeLost, setStrikeLost] = useState(0);
  const strikeRef = useRef(strike);
  useEffect(() => { strikeRef.current = strike; }, [strike]);
  const getLevelInitialTime = (lvl: typeof currentLevel) => {
    if (lvl.timeLimit && lvl.timeLimit > 0 && lvl.timeLimit <= 130) {
      return lvl.timeLimit;
    }
    const count = lvl.targetWords?.length || 5;
    const isHardest = Boolean(
      lvl.subtitle && (lvl.subtitle.includes('HARDEST') || lvl.subtitle.includes('BOSS') || lvl.subtitle.includes('CLIMAX'))
    );
    const isHard = Boolean(lvl.subtitle && lvl.subtitle.includes('HARD')) || isHardest;

    // Dynamically reduced timer so hard levels feel genuinely fast-paced and challenging:
    if (count <= 4) return 80;
    if (count === 5) return 85;
    if (count === 6) return isHard ? 90 : 95;
    if (count === 7) return isHard ? 95 : 100;
    if (count === 8) return isHardest ? 100 : 105;
    if (count === 9) return isHardest ? 110 : 115;
    return 120; // 10 words: max 120s for intense boss feel!
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getLevelInitialTime(currentLevel));
  const timeLeftRef = useRef(timeLeft);
  const [hintedCells, setHintedCells] = useState<{ r: number; c: number }[]>([]);
  const [hasUsedCoinHint, setHasUsedCoinHint] = useState(false);
  const hasUsedCoinHintRef = useRef(false);
  const [isScrollingEnabled, setIsScrollingEnabled] = useState<boolean>(true);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const star1Anim = useRef(new Animated.Value(0)).current;
  const star2Anim = useRef(new Animated.Value(0)).current;
  const star3Anim = useRef(new Animated.Value(0)).current;

  // Loss animation refs
  const lossScaleAnim = useRef(new Animated.Value(1)).current;
  const lossShakeAnim = useRef(new Animated.Value(0)).current;
  const lossHeartAnim = useRef(new Animated.Value(1)).current;
  const lossStrikeAnim = useRef(new Animated.Value(1)).current;
  const floatMinusOneAnim = useRef(new Animated.Value(0)).current;
  const floatMinusOneY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isGameOver) {
      lossScaleAnim.setValue(0.7);
      lossShakeAnim.setValue(0);
      lossHeartAnim.setValue(0);
      lossStrikeAnim.setValue(0);
      floatMinusOneAnim.setValue(0);
      floatMinusOneY.setValue(0);

      Animated.sequence([
        Animated.spring(lossScaleAnim, { toValue: 1, friction: 5, tension: 50, useNativeDriver: true }),
        Animated.parallel([
          Animated.spring(lossHeartAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
          Animated.spring(lossStrikeAnim, { toValue: 1, friction: 4, tension: 50, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(floatMinusOneAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(floatMinusOneY, { toValue: -20, duration: 600, useNativeDriver: true }),
          ]),
        ]),
      ]).start();
    }
  }, [isGameOver]);

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

  // Pause BGM when entering GameView, resume when exiting
  useEffect(() => {
    nativeAudio.setInGame(true);
    return () => {
      nativeAudio.setInGame(false);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isGameOver) {
      dragActiveRef.current = false;
      nativeAudio.cancelLetterTaps();
      setIsScrollingEnabled(true);
      setSelectedCells([]);
      setSpelledWord('');
    }
  }, [isPaused, isGameOver]);

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
  const onCompleteLevelRef = useRef(onCompleteLevel);
  useEffect(() => {
    onFailLevelRef.current = onFailLevel;
    onCompleteLevelRef.current = onCompleteLevel;
  }, [onFailLevel, onCompleteLevel]);

  // Finish an attempt synchronously, before the victory animation delay. Both
  // the timer and touch callbacks consult this ref even before React renders.
  const finishVictory = useCallback(() => {
    if (attemptStatusRef.current !== 'playing' || pausedRef.current) return;
    attemptStatusRef.current = 'won';
    victoryTimeoutRef.current = setTimeout(() => {
      victoryTimeoutRef.current = null;
      if (!mountedRef.current || attemptStatusRef.current !== 'won') return;
      setIsVictory(true);
      nativeAudio.playVictory();
    }, 450);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      attemptStatusRef.current = 'exited';
      if (victoryTimeoutRef.current !== null) clearTimeout(victoryTimeoutRef.current);
    };
  }, []);

  // Keep side effects outside React state updaters, which may be replayed.
  useEffect(() => {
    if (isPaused || isVictory || isGameOver) return;

    const timer = setInterval(() => {
      if (pausedRef.current || attemptStatusRef.current !== 'playing') return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current === 0) {
        attemptStatusRef.current = 'lost';
        clearInterval(timer);
        setStrikeLost(Math.min(Math.max(0, strikeRef.current), STRIKE_LOSS_PENALTY));
        setIsGameOver(true);
        nativeAudio.playGameOver();
        onFailLevelRef.current?.();
      }
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
    if (victoryTimeoutRef.current !== null) clearTimeout(victoryTimeoutRef.current);
    victoryTimeoutRef.current = null;
    attemptStatusRef.current = 'playing';
    completionClaimedRef.current = false;
    pausedRef.current = false;
    timeLeftRef.current = getLevelInitialTime(lvl);
    nativeAudio.cancelLetterTaps();
    dragActiveRef.current = false;
    dragSelectionRef.current = [];
    setGrid(lvl.grid);
    setTargetWords(lvl.targetWords.map((tw) => ({ ...tw, found: false })));
    setSolvedCells([]);
    setSelectedCells([]);
    setSpelledWord('');
    setIsVictory(false);
    setIsPaused(false);
    setIsGameOver(false);
    setTimeLeft(timeLeftRef.current);
    setHintedCells([]);
    setLastFoundMessage(null);
    setStrikeLost(0);
    setWordStreak(0);
    setMaxWordStreak(0);
  }, [levelId]);

  useEffect(() => {
    hasUsedCoinHintRef.current = false;
    setHasUsedCoinHint(false);
    resetLevelState(currentLevel);
  }, [levelId]);

  const foundCount = targetWords.filter((w) => w.found).length;
  const totalCount = targetWords.length;

  const handlePause = () => {
    if (attemptStatusRef.current !== 'playing') return;
    pausedRef.current = true;
    setIsPaused(true);
  };

  const handleResume = () => {
    if (attemptStatusRef.current !== 'playing') return;
    pausedRef.current = false;
    setIsPaused(false);
  };

  const handleExit = () => {
    if (isRestoringStrike) return;
    attemptStatusRef.current = 'exited';
    onExit();
  };

  const handleRetry = () => {
    if (isRestoringStrike || attemptStatusRef.current !== 'lost') return;
    if (strike <= 0) {
      onRestoreStrike?.(() => {
        if (mountedRef.current && attemptStatusRef.current === 'lost') resetLevelState(currentLevel);
      });
      return;
    }
    resetLevelState(currentLevel);
  };

  const handleCompleteAttempt = useCallback((target: 'next' | 'map' = 'next') => {
    // Tapping the celebration and its action buttons can both fire.
    if (attemptStatusRef.current !== 'won' || completionClaimedRef.current) return;
    completionClaimedRef.current = true;
    nativeAudio.stopVictory();
    onCompleteLevelRef.current(levelId, 3, 50, target);
  }, [levelId]);

  // Check if given cells spell any unfound target word
  const checkSelection = useCallback(
    (cells: { r: number; c: number }[]): boolean => {
      if (attemptStatusRef.current !== 'playing' || pausedRef.current) return false;
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
          finishVictory();
        }
        return true;
      }
      return false;
    },
    [grid, targetWords, finishVictory]
  );

  // Fix stale closures in PanResponder by using a ref for current state values
  const gameStateRef = useRef({ isPaused, isVictory, isGameOver, grid, checkSelection });
  
  useEffect(() => {
    gameStateRef.current = { isPaused, isVictory, isGameOver, grid, checkSelection };
  }, [isPaused, isVictory, isGameOver, grid, checkSelection]);

  // Both move and release must resolve the endpoint: native touch events can
  // skip intermediate cells (or every move event) during a quick swipe.
  const updateDragSelection = (locationX: number, locationY: number) => {
    const state = gameStateRef.current;
    if (!dragActiveRef.current || state.isPaused || state.isVictory || state.isGameOver) return;
    const c = Math.floor(locationX / tileSizeRef.current);
    const r = Math.floor(locationY / tileSizeRef.current);
    if (r < 0 || r >= 8 || c < 0 || c >= 8 || !state.grid[r]?.[c] || state.grid[r][c] === ' ') return;

    const prev = dragSelectionRef.current;
    const lastCell = prev[prev.length - 1];
    if (lastCell?.r === r && lastCell.c === c) return;
    const startCell = prev[0];
    const updated: { r: number; c: number }[] = [];
    if (!startCell) {
      updated.push({ r, c });
    } else {
      const dr = r - startCell.r;
      const dc = c - startCell.c;
      // Keep the existing horizontal, vertical and diagonal selection rules.
      if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return;
      const stepR = Math.sign(dr);
      const stepC = Math.sign(dc);
      const len = Math.max(Math.abs(dr), Math.abs(dc));
      for (let i = 0; i <= len; i++) {
        updated.push({ r: startCell.r + i * stepR, c: startCell.c + i * stepC });
      }
    }

    let sharedCells = 0;
    while (sharedCells < prev.length && sharedCells < updated.length
      && prev[sharedCells].r === updated[sharedCells].r
      && prev[sharedCells].c === updated[sharedCells].c) {
      sharedCells++;
    }
    // Recover clicks for each crossed cell, including coalesced moves and
    // backtracking. Audio is paced separately; the selection updates now.
    const crossedCells = Math.max(prev.length - sharedCells, updated.length - sharedCells);
    dragSelectionRef.current = updated;
    nativeAudio.playLetterTaps(crossedCells);
    setSelectedCells(updated);
    setSpelledWord(updated.map((cell) => state.grid[cell.r][cell.c]).join(''));
  };

  // PanResponder for smooth drag / swipe selection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const state = gameStateRef.current;
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        nativeAudio.cancelLetterTaps();
        dragActiveRef.current = true;
        setIsScrollingEnabled(false);
        dragSelectionRef.current = [];
        setSelectedCells([]);
        setSpelledWord('');
        const { locationX, locationY } = evt.nativeEvent;
        updateDragSelection(locationX, locationY);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        updateDragSelection(locationX, locationY);
      },
      onPanResponderRelease: (evt) => {
        if (!dragActiveRef.current) return;
        const { locationX, locationY } = evt.nativeEvent;
        updateDragSelection(locationX, locationY);
        dragActiveRef.current = false;
        setIsScrollingEnabled(true);
        const state = gameStateRef.current;
        const current = dragSelectionRef.current;
        dragSelectionRef.current = [];
        setSelectedCells([]);
        setSpelledWord('');
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        const solved = state.checkSelection(current);
        if (!solved && current.length >= 2) triggerStreakReset();
      },
      onPanResponderTerminate: () => {
        nativeAudio.cancelLetterTaps();
        dragActiveRef.current = false;
        setIsScrollingEnabled(true);
        dragSelectionRef.current = [];
        setSelectedCells([]);
        setSpelledWord('');
      },
    })
  ).current;

  // Tap-to-select support (tap letters one by one)
  const handleTileClick = (r: number, c: number) => {
    if (pausedRef.current || attemptStatusRef.current !== 'playing') return;
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

  // One coin-funded hint is allowed per level; further hints use rewarded ads.
  const handleHint = () => {
    if (pausedRef.current || attemptStatusRef.current !== 'playing') return;
    const unfound = targetWords.find((tw) => !tw.found);
    if (!unfound) return;

    if (hasUsedCoinHintRef.current) {
      setAlertInfo({
        title: 'Ad Hint Required',
        message: 'Your coin hint for this level is already used. Watch an ad to unlock another hint.',
      });
      return;
    }

    if (!onUseHint()) {
      setAlertInfo({ title: 'Coins Needed', message: `You need ${HINT_COST} coins for a Hint!` });
      return;
    }

    hasUsedCoinHintRef.current = true;
    setHasUsedCoinHint(true);
    nativeAudio.playSparkle();
    setHintedCells([{ r: unfound.rowStart, c: unfound.colStart }]);
    setTimeout(() => setHintedCells([]), 3500);
  };

  // Rewarded Ad: grant one hint directly after the ad is watched.
  const handleRewardedHint = () => {
    if (pausedRef.current || attemptStatusRef.current !== 'playing') return;
    const unfound = targetWords.find((tw) => !tw.found);
    if (!unfound) {
      setAlertInfo({ title: 'No Words Left', message: 'All words are already found!' });
      return;
    }

    showRewardedAd(() => {
      setAlertInfo({
        title: '🎁 Ad Hint Unlocked!',
        message: 'You watched an ad! Tap GOT IT to reveal a hint on the grid.',
        onConfirm: () => {
          nativeAudio.playSparkle();
          setHintedCells([{ r: unfound.rowStart, c: unfound.colStart }]);
          setTimeout(() => setHintedCells([]), 3500);
        },
      });
    });
  };

  // Power-up: reveal an entire word at a premium over a single-cell hint.
  const handleReveal = () => {
    if (pausedRef.current || attemptStatusRef.current !== 'playing') return;
    const unfoundIdx = targetWords.findIndex((tw) => !tw.found);
    if (unfoundIdx === -1) return;

    if (coins < REVEAL_COST) {
      setAlertInfo({ title: 'Coins Needed', message: `You need ${REVEAL_COST} coins to Reveal a word!` });
      return;
    }

    if (!onDeductCoins(REVEAL_COST)) return;

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
      finishVictory();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} scrollEnabled={isScrollingEnabled}>


      {/* Target Words Drawer */}
      <View style={[styles.wordsCard, contentWidthStyle]}>
        <View style={styles.wordsHeader}>
          <View style={styles.wordsTitleRow}>
            <MaterialIcons name="search" size={16} color="#4D8AFF" />
            <Text style={styles.wordsTitle}>WORDS TO FIND</Text>
            {currentLevel.maskName && (
              <View style={styles.maskTagBadge}>
                <Text style={styles.maskTagText}>
                  {currentLevel.maskIcon} {currentLevel.maskName.toUpperCase()}
                </Text>
              </View>
            )}
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
      <View style={[styles.spellingBar, contentWidthStyle]}>
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
      <View style={[styles.timerControlRow, contentWidthStyle]}>
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
          onPress={handlePause}
          style={({ pressed }) => [styles.pauseBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="pause" size={20} color="#172858" />
        </Pressable>
      </View>



      {/* 8x8 Interactive Word Search Matrix (0-Gap Flat Square Matrix) with Drag & Tap */}
      <View
        style={[styles.matrixCard, { width: gridSize, height: gridSize }]}
      >
        <View
          {...panResponder.panHandlers}
          style={[styles.gridContainer, { width: gridSize, height: gridSize }]}
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
                          width: tileSize,
                          height: tileSize,
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
                        width: tileSize - 4,
                        height: tileSize - 4,
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
                    <Text
                      style={[
                        styles.tileLetter,
                        compactLayout && styles.tileLetterCompact,
                        { color: tileColor },
                      ]}
                    >
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
      <View style={[styles.actionRow, contentWidthStyle, compactLayout && styles.actionRowCompact]}>
        {/* Shuffle */}
        <Pressable
          onPress={handleShuffle}
          style={({ pressed }) => [styles.actionBtn, compactLayout && styles.actionBtnCompact, styles.shuffleBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="refresh" size={20} color="#7C3AED" />
          <Text style={[styles.actionBtnTitle, { color: '#7C3AED' }]}>CLEAR</Text>
          <Text style={[styles.actionBtnSub, { color: '#7C3AED' }]}>Free</Text>
        </Pressable>

        {/* Hint */}
        <Pressable
          onPress={handleHint}
          style={({ pressed }) => [styles.actionBtn, compactLayout && styles.actionBtnCompact, styles.hintBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="lightbulb" size={20} color="#B45309" />
          <Text style={[styles.actionBtnTitle, { color: '#B45309' }]}>HINT</Text>
          <Text style={[styles.actionBtnSub, { color: '#B45309' }]}>
            {hasUsedCoinHint ? 'Ad only' : `🪙 ${HINT_COST}`}
          </Text>
        </Pressable>

        {/* Ad-rewarded hint */}
        <Pressable
          onPress={handleRewardedHint}
          style={({ pressed }) => [styles.actionBtn, compactLayout && styles.actionBtnCompact, { backgroundColor: '#E0F2FE', borderColor: '#38BDF8' }, pressed && styles.pressed]}
        >
          <MaterialIcons name="ondemand-video" size={20} color="#0284C7" />
          <Text style={[styles.actionBtnTitle, { color: '#0284C7' }]}>AD HINT</Text>
          <Text style={[styles.actionBtnSub, { color: '#0284C7' }]}>🎬 Watch Ad</Text>
        </Pressable>

        {/* Reveal */}
        <Pressable
          onPress={handleReveal}
          style={({ pressed }) => [styles.actionBtn, compactLayout && styles.actionBtnCompact, styles.revealBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="auto-fix-high" size={20} color="#0D9488" />
          <Text style={[styles.actionBtnTitle, { color: '#0D9488' }]}>REVEAL</Text>
          <Text style={[styles.actionBtnSub, { color: '#0D9488' }]}>🪙 {REVEAL_COST}</Text>
        </Pressable>
      </View>

      {/* Level Victory Modal with Winged Crest, Golden Sunburst & Party Confetti / Zario Ribbons */}
      <VictoryModal
        visible={isVictory}
        levelId={levelId}
        maxWordStreak={maxWordStreak}
        coinsEarned={50}
        strikeEarned={STRIKE_WIN_REWARD}
        xpEarned={100}
        onNextLevel={() => handleCompleteAttempt('next')}
        onGoToMap={() => handleCompleteAttempt('map')}
      />

      {/* Pause Modal */}
      <Modal visible={isPaused} transparent animationType="fade" onRequestClose={handleResume}>
        <View style={styles.modalBackdrop}>
          <View style={styles.gameOverCard}>
            <View style={styles.timerCircle}>
              <MaterialIcons name="pause-circle-filled" size={38} color="#7C3AED" />
            </View>
            <Text style={styles.gameOverTitle}>GAME PAUSED</Text>
            <Text style={styles.gameOverSubtitle}>
              Level {levelId} • {formatTime(timeLeft)} remaining
            </Text>

            <Pressable
              onPress={handleResume}
              style={({ pressed }) => [styles.retryBtn, pressed && styles.pressed]}
            >
              <Text style={styles.retryBtnText}>RESUME</Text>
            </Pressable>

            <Pressable
              onPress={handleExit}
              style={({ pressed }) => [styles.exitBtn, pressed && styles.pressed]}
            >
              <Text style={styles.exitBtnText}>EXIT TO MAP</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Game Over Time-Out Modal */}
      <Modal visible={isGameOver} transparent animationType="fade" onRequestClose={handleExit}>
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

            {/* Loss Animations: -1 Heart & actual Strike deduction */}
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

              {/* Strike Penalty Box */}
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
                <Text style={[styles.lossBadgeValue, { color: '#EA580C' }]}>-{strikeLost} 🔥</Text>
                <Text style={[styles.lossBadgeLabel, { color: '#C2410C' }]}>STRIKE LOST</Text>
              </Animated.View>
            </View>
            <Text style={styles.pauseSub}>Strike remaining: {strike} 🔥</Text>

            <Pressable
              disabled={isRestoringStrike}
              onPress={handleRetry}
              style={({ pressed }) => [styles.resumeBtn, { backgroundColor: '#EF4444', opacity: isRestoringStrike ? 0.6 : 1 }, pressed && styles.pressed]}
            >
              <Text style={styles.resumeBtnText}>
                {isRestoringStrike ? 'LOADING AD…' : strike <= 0 ? 'WATCH AD TO RESTORE 🔥 & RETRY' : 'TRY AGAIN'}
              </Text>
            </Pressable>

            <Pressable
              disabled={isRestoringStrike}
              onPress={handleExit}
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
  maskTagBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginLeft: 6,
  },
  maskTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#0369A1',
    letterSpacing: 0.3,
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
  tileLetterCompact: {
    fontSize: 20,
  },
  actionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
  actionRowCompact: {
    flexWrap: 'wrap',
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
  actionBtnCompact: {
    flexBasis: '47%',
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

  gameOverCard: {
    width: '100%',
    maxWidth: 280,
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
  strikePenaltyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    padding: 10,
    marginBottom: 14,
    width: '100%',
  },
  strikePenaltyTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#EF4444',
  },
  strikePenaltySub: {
    fontSize: 10,
    color: '#B0C2E8',
    marginTop: 2,
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
    width: '100%',
    maxWidth: 270,
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

