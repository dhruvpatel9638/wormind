import React, { useState, useEffect, useRef, useCallback, ComponentRef } from 'react';
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
  AppState,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { TargetWord } from '../../types';
import { INITIAL_LEVELS } from '../../data/gameData';
import { nativeAudio } from '../audio';
import { nativeHaptics } from '../haptics';
import { CustomAlert } from '../components/CustomAlert';
import { VictoryModal } from '../components/VictoryModal';
import { GamePausedModal, GameOverModal } from '../components/WorMindPopups';
import {
  showRewardedAd,
  isAdCurrentlyShowing,
  getLastAdDismissedAt,
  addAdDismissListener,
} from '../../utils/admobService';
import { STRIKE_LOSS_PENALTY, STRIKE_WIN_REWARD } from '../../config/strike';
import { HINT_COST, REVEAL_COST } from '../../config/economy';
import { getLevelDifficultyConfig } from '../../config/difficultyScaling';
import { getLevelById } from '../../utils/endlessLevelGenerator';

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
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  hapticsEnabled?: boolean;
  onToggleSound?: () => void;
  onToggleMusic?: () => void;
  onToggleHaptics?: () => void;
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
  soundEnabled = true,
  musicEnabled = true,
  hapticsEnabled = true,
  onToggleSound,
  onToggleMusic,
  onToggleHaptics,
}) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const compactLayout = windowWidth <= 360;
  const currentLevel = getLevelById(levelId);
  const numRows = currentLevel.grid?.length || 8;
  const numCols = currentLevel.grid?.[0]?.length || 8;
  const maxDim = Math.max(numRows, numCols);
  const isLargeGrid = maxDim > 8;
  const isRandomLevel = levelId > 150;
  const isZoomableLevel = isRandomLevel || Boolean(currentLevel.isMegaGrid) || isLargeGrid;

  const gridSize = isZoomableLevel
    ? Math.min(windowWidth, 420)
    : Math.max(232, Math.min(windowWidth - 28, 380, windowHeight <= 700 ? windowHeight * 0.43 : 380));
  const matrixHeight = isZoomableLevel
    ? Math.max(300, Math.min(windowWidth, 420, windowHeight <= 700 ? windowHeight * 0.50 : 420))
    : gridSize;
  const tileSize = gridSize / maxDim;
  const tileSizeRef = useRef(tileSize);
  tileSizeRef.current = tileSize;
  const contentWidthStyle = { width: '100%' as const, maxWidth: 600 };

  const tileFontSize = isLargeGrid
    ? Math.max(12, Math.round(tileSize * 0.52))
    : (compactLayout ? 20 : 24);

  // ── Pinch-to-zoom & Pan state ──────────────────────────────────────────
  const zoomScale = useRef(new Animated.Value(1)).current;
  const zoomScaleValue = useRef(1);
  const panX = useRef(new Animated.Value(0)).current;
  const panXValue = useRef(0);
  const panY = useRef(new Animated.Value(0)).current;
  const panYValue = useRef(0);
  const [displayZoom, setDisplayZoom] = useState(1);

  const pinchStartDist = useRef<number | null>(null);
  const pinchStartScale = useRef(1);
  const pinchStartMid = useRef<{ x: number; y: number } | null>(null);
  const pinchStartPan = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isTwoFingerActive = useRef(false);

  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 2.8;

  const matrixCardRef = useRef<ComponentRef<typeof View>>(null);
  const matrixLayoutRef = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });

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
  const diffConfig = getLevelDifficultyConfig(levelId);
  const getLevelInitialTime = (lvl: typeof currentLevel) => {
    if (lvl.timeLimit && lvl.timeLimit > 0 && lvl.timeLimit <= 360) {
      return lvl.timeLimit;
    }
    return diffConfig.timeLimit;
  };

  const [timeLeft, setTimeLeft] = useState<number>(() => getLevelInitialTime(currentLevel));
  const timeLeftRef = useRef(timeLeft);
  const [hintedCells, setHintedCells] = useState<{ r: number; c: number }[]>([]);
  const [hasUsedCoinHint, setHasUsedCoinHint] = useState(false);
  const hasUsedCoinHintRef = useRef(false);
  const isAdActiveRef = useRef(false);

  // Turn off BGM on game screen, resume when leaving GameView
  useEffect(() => {
    nativeAudio.setInGame(true);
    return () => {
      nativeAudio.setInGame(false);
    };
  }, []);

  useEffect(() => {
    nativeHaptics.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  useEffect(() => {
    nativeAudio.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    nativeAudio.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  const toggleSound = () => {
    if (onToggleSound) {
      onToggleSound();
    } else {
      nativeAudio.setSoundEnabled(!soundEnabled);
    }
  };

  const toggleMusic = () => {
    if (onToggleMusic) {
      onToggleMusic();
    } else {
      nativeAudio.setMusicEnabled(!musicEnabled);
    }
  };

  const toggleHaptics = () => {
    if (onToggleHaptics) {
      onToggleHaptics();
    } else {
      const next = !hapticsEnabled;
      nativeHaptics.setEnabled(next);
      if (next) nativeHaptics.selection();
    }
  };
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

  // Listen for ad dismissal and AppState changes:
  // When an ad completes, seamlessly return to gameplay without showing the resume popup!
  useEffect(() => {
    const unsubscribeAdDismiss = addAdDismissListener(() => {
      isAdActiveRef.current = false;
      pausedRef.current = false;
      setIsPaused(false);
    });

    const sub = AppState.addEventListener('change', (nextState) => {
      const isAdEvent = isAdCurrentlyShowing() || (Date.now() - getLastAdDismissedAt() < 2500);

      if (nextState !== 'active') {
        if (isAdEvent) {
          // Screen was covered by an Ad (rewarded or interstitial).
          // Freeze letter taps and mark ad active, but NEVER show the pause modal!
          isAdActiveRef.current = true;
          nativeAudio.cancelLetterTaps();
          return;
        }
        // Genuine user minimizing the app or locking device
        if (attemptStatusRef.current === 'playing') {
          pausedRef.current = true;
          setIsPaused(true);
          nativeAudio.cancelLetterTaps();
        }
      } else if (nextState === 'active') {
        if (isAdActiveRef.current || isAdEvent) {
          // Returned from an ad: clear pause state so player directly enters gameplay
          isAdActiveRef.current = false;
          pausedRef.current = false;
          setIsPaused(false);
        }
      }
    });

    return () => {
      unsubscribeAdDismiss();
      sub.remove();
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
      nativeHaptics.success();
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
      if (pausedRef.current || isAdActiveRef.current || isAdCurrentlyShowing() || attemptStatusRef.current !== 'playing') return;
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current === 0) {
        attemptStatusRef.current = 'lost';
        clearInterval(timer);
        setStrikeLost(Math.min(Math.max(0, strikeRef.current), STRIKE_LOSS_PENALTY));
        setIsGameOver(true);
        nativeAudio.playGameOver();
        nativeHaptics.error();
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
    setIsPaused(false);
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
    // Reset zoom and pan
    zoomScale.setValue(1);
    zoomScaleValue.current = 1;
    panX.setValue(0);
    panXValue.current = 0;
    panY.setValue(0);
    panYValue.current = 0;
    pinchStartDist.current = null;
    pinchStartMid.current = null;
    isTwoFingerActive.current = false;
    setDisplayZoom(1);
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
    const finalCoins = Math.round(50 * diffConfig.coinMultiplier);
    onCompleteLevelRef.current(levelId, 3, finalCoins, target);
  }, [levelId, diffConfig.coinMultiplier]);

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
        nativeHaptics.success();

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

  // Resolves precise client touch position relative to matrixCard top-left
  const resolveTouchPoint = (evt: any) => {
    const layout = matrixLayoutRef.current;
    if (layout.width > 0 && evt.nativeEvent.pageX !== undefined && evt.nativeEvent.pageY !== undefined) {
      return {
        clientX: evt.nativeEvent.pageX - layout.x,
        clientY: evt.nativeEvent.pageY - layout.y,
      };
    }
    return {
      clientX: evt.nativeEvent.locationX,
      clientY: evt.nativeEvent.locationY,
    };
  };

  // High-precision directional raycast drag selection with snap tolerance for high-density grids
  const updateDragSelection = (clientX: number, clientY: number) => {
    const state = gameStateRef.current;
    if (!dragActiveRef.current || state.isPaused || state.isVictory || state.isGameOver) return;

    // Account for zoom scale and pan offset relative to center of matrix
    const containerW = isZoomableLevel ? windowWidth : gridSize;
    const containerH = isZoomableLevel ? matrixHeight : gridSize;
    const centerX = containerW / 2;
    const centerY = containerH / 2;
    const scale = zoomScaleValue.current;
    const pX = panXValue.current;
    const pY = panYValue.current;

    const gridX = (gridSize / 2) + (clientX - centerX - pX) / scale;
    const gridY = (gridSize / 2) + (clientY - centerY - pY) / scale;

    const tileSize = tileSizeRef.current;
    const fR = gridY / tileSize;
    const fC = gridX / tileSize;

    const rows = state.grid.length;
    const cols = state.grid[0]?.length || 0;

    const prev = dragSelectionRef.current;
    const startCell = prev[0];

    const updated: { r: number; c: number }[] = [];

    if (!startCell) {
      // First touch: determine start cell with nearby snap tolerance for small cells
      let r = Math.floor(fR);
      let c = Math.floor(fC);

      if (r < 0 || r >= rows || c < 0 || c >= cols || !state.grid[r]?.[c] || state.grid[r][c] === ' ') {
        let bestDist = Infinity;
        let bestNeighbor: { r: number; c: number } | null = null;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && state.grid[nr]?.[nc] && state.grid[nr][nc] !== ' ') {
              const d = Math.hypot(fR - (nr + 0.5), fC - (nc + 0.5));
              if (d < bestDist && d <= 0.85) {
                bestDist = d;
                bestNeighbor = { r: nr, c: nc };
              }
            }
          }
        }
        if (bestNeighbor) {
          r = bestNeighbor.r;
          c = bestNeighbor.c;
        } else {
          return;
        }
      }
      updated.push({ r, c });
    } else {
      // Drag in progress: Directional Snap Raycast from startCell
      const dx = fC - (startCell.c + 0.5);
      const dy = fR - (startCell.r + 0.5);
      const dist = Math.hypot(dx, dy);

      if (dist < 0.35) {
        // Finger still hovering within start cell
        updated.push(startCell);
      } else {
        // Map continuous drag vector into 8 directional compass sectors (45° cone each)
        const normDeg = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
        const sector = Math.floor((normDeg + 22.5) / 45) % 8;
        const DIRS = [
          { stepR: 0, stepC: 1, diag: false },  // 0: Right (0°)
          { stepR: 1, stepC: 1, diag: true },   // 1: Down-Right (45°)
          { stepR: 1, stepC: 0, diag: false },  // 2: Down (90°)
          { stepR: 1, stepC: -1, diag: true },  // 3: Down-Left (135°)
          { stepR: 0, stepC: -1, diag: false }, // 4: Left (180°)
          { stepR: -1, stepC: -1, diag: true }, // 5: Up-Left (225°)
          { stepR: -1, stepC: 0, diag: false }, // 6: Up (270°)
          { stepR: -1, stepC: 1, diag: true },  // 7: Up-Right (315°)
        ];
        const dir = DIRS[sector];

        // Projected distance along the locked direction ray
        const projected = dir.diag
          ? (dx * dir.stepC + dy * dir.stepR) / 1.41421356
          : (dx * dir.stepC + dy * dir.stepR);
        const steps = Math.max(0, Math.round(projected));

        // Trace cells along ray from startCell up to steps
        for (let i = 0; i <= steps; i++) {
          const currR = startCell.r + i * dir.stepR;
          const currC = startCell.c + i * dir.stepC;
          if (currR < 0 || currR >= rows || currC < 0 || currC >= cols) break;
          if (!state.grid[currR]?.[currC] || state.grid[currR][currC] === ' ') break;
          updated.push({ r: currR, c: currC });
        }
      }
    }

    if (updated.length === 0) return;

    // Avoid redundant renders if selection hasn't changed
    if (prev.length === updated.length && prev.every((cell, idx) => cell.r === updated[idx].r && cell.c === updated[idx].c)) {
      return;
    }

    let sharedCells = 0;
    while (sharedCells < prev.length && sharedCells < updated.length
      && prev[sharedCells].r === updated[sharedCells].r
      && prev[sharedCells].c === updated[sharedCells].c) {
      sharedCells++;
    }

    const crossedCells = Math.max(prev.length - sharedCells, updated.length - sharedCells);
    dragSelectionRef.current = updated;
    nativeAudio.playLetterTaps(crossedCells);
    if (crossedCells > 0) {
      nativeHaptics.light();
    }
    setSelectedCells(updated);
    setSpelledWord(updated.map((cell) => state.grid[cell.r][cell.c]).join(''));
  };

  // ── Two-Finger Pinch-to-Zoom & Pan Helpers ────────────────────────────────
  const getPinchDist = (touches: { pageX: number; pageY: number }[]): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPinchMid = (touches: { pageX: number; pageY: number }[]) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].pageX + touches[1].pageX) / 2,
      y: (touches[0].pageY + touches[1].pageY) / 2,
    };
  };

  // Unified PanResponder for 1-finger word selection & 2-finger zoom/pan
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        const state = gameStateRef.current;
        if (state.isPaused || state.isVictory || state.isGameOver) return;

        const touches = Array.from(evt.nativeEvent.touches);
        if (isZoomableLevel && touches.length >= 2) {
          isTwoFingerActive.current = true;
          dragActiveRef.current = false;
          dragSelectionRef.current = [];
          setSelectedCells([]);
          setSpelledWord('');

          pinchStartDist.current = getPinchDist(touches);
          pinchStartScale.current = zoomScaleValue.current;
          pinchStartMid.current = getPinchMid(touches);
          pinchStartPan.current = { x: panXValue.current, y: panYValue.current };
          return;
        }

        isTwoFingerActive.current = false;
        matrixCardRef.current?.measureInWindow((x, y, w, h) => {
          if (w > 0 && h > 0) {
            matrixLayoutRef.current = { x, y, width: w, height: h };
          }
        });
        nativeAudio.cancelLetterTaps();
        dragActiveRef.current = true;
        setIsScrollingEnabled(false);
        dragSelectionRef.current = [];
        setSelectedCells([]);
        setSpelledWord('');
        const pt = resolveTouchPoint(evt);
        updateDragSelection(pt.clientX, pt.clientY);
      },
      onPanResponderMove: (evt) => {
        const touches = Array.from(evt.nativeEvent.touches);

        if (isZoomableLevel && (touches.length >= 2 || isTwoFingerActive.current)) {
          if (touches.length >= 2) {
            isTwoFingerActive.current = true;
            dragActiveRef.current = false;
            dragSelectionRef.current = [];
            setSelectedCells([]);
            setSpelledWord('');

            const dist = getPinchDist(touches);
            const mid = getPinchMid(touches);

            if (pinchStartDist.current === null) {
              pinchStartDist.current = dist;
              pinchStartScale.current = zoomScaleValue.current;
              pinchStartMid.current = mid;
              pinchStartPan.current = { x: panXValue.current, y: panYValue.current };
            }

            const newScale = Math.min(
              MAX_ZOOM,
              Math.max(MIN_ZOOM, pinchStartScale.current * (dist / pinchStartDist.current))
            );
            zoomScaleValue.current = newScale;
            zoomScale.setValue(newScale);
            setDisplayZoom(Math.round(newScale * 10) / 10);

            if (pinchStartMid.current) {
              const deltaX = mid.x - pinchStartMid.current.x;
              const deltaY = mid.y - pinchStartMid.current.y;
              const containerW = isZoomableLevel ? windowWidth : gridSize;
              const containerH = isZoomableLevel ? matrixHeight : gridSize;
              const maxPanX = Math.max(20, (gridSize * newScale - containerW) / 2 + 25);
              const maxPanY = Math.max(20, (gridSize * newScale - containerH) / 2 + 25);
              const newPanX = Math.min(maxPanX, Math.max(-maxPanX, pinchStartPan.current.x + deltaX));
              const newPanY = Math.min(maxPanY, Math.max(-maxPanY, pinchStartPan.current.y + deltaY));
              panXValue.current = newPanX;
              panX.setValue(newPanX);
              panYValue.current = newPanY;
              panY.setValue(newPanY);
            }
          }
          return;
        }

        if (dragActiveRef.current && !isTwoFingerActive.current) {
          const pt = resolveTouchPoint(evt);
          updateDragSelection(pt.clientX, pt.clientY);
        }
      },
      onPanResponderRelease: (evt) => {
        if (isTwoFingerActive.current) {
          pinchStartDist.current = null;
          pinchStartMid.current = null;
          isTwoFingerActive.current = false;
          setIsScrollingEnabled(true);
          if (zoomScaleValue.current <= 1.05) {
            panX.setValue(0);
            panXValue.current = 0;
            panY.setValue(0);
            panYValue.current = 0;
          }
          return;
        }

        if (!dragActiveRef.current) return;
        const pt = resolveTouchPoint(evt);
        updateDragSelection(pt.clientX, pt.clientY);
        dragActiveRef.current = false;
        setIsScrollingEnabled(true);
        const state = gameStateRef.current;
        const current = dragSelectionRef.current;
        dragSelectionRef.current = [];
        setSelectedCells([]);
        setSpelledWord('');
        if (state.isPaused || state.isVictory || state.isGameOver) return;
        const solved = state.checkSelection(current);
        if (!solved && current.length >= 2) {
          triggerStreakReset();
          nativeHaptics.warning();
        }
      },
      onPanResponderTerminate: () => {
        pinchStartDist.current = null;
        pinchStartMid.current = null;
        isTwoFingerActive.current = false;
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
      nativeHaptics.light();
    } else {
      // Add tile
      const newSelection = [...selectedCells, { r, c }];
      setSelectedCells(newSelection);
      const newWord = newSelection.map((cell) => grid[cell.r][cell.c]).join('');
      setSpelledWord(newWord);
      nativeAudio.playLetterTap(newSelection.length);
      nativeHaptics.light();

      // Check if this tap completes a target word
      checkSelection(newSelection);
    }
  };

  const handleClear = () => {
    nativeHaptics.light();
    if (selectedCells.length >= 2) {
      triggerStreakReset();
    }
    setSelectedCells([]);
    setSpelledWord('');
  };

  // Power-up: Shuffle (clears board selection)
  const handleShuffle = () => {
    nativeAudio.playLetterTap(1);
    nativeHaptics.light();
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
    nativeHaptics.medium();
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
    nativeHaptics.success();
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

      {/* Timer & Streak Row (Spelling row removed - grid moved up) */}
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

          {/* Real-time word preview or found alert inline in timer row */}
          {spelledWord !== '' ? (
            <View style={styles.inlineSpelledChip}>
              <Text numberOfLines={1} style={styles.inlineSpelledText}>
                {spelledWord}
              </Text>
            </View>
          ) : lastFoundMessage ? (
            <View style={styles.inlineFoundChip}>
              <Text numberOfLines={1} style={styles.inlineFoundText}>
                {lastFoundMessage}
              </Text>
            </View>
          ) : null}
        </View>

        <Pressable
          onPress={handlePause}
          style={({ pressed }) => [styles.pauseBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="pause" size={20} color="#172858" />
        </Pressable>
      </View>



      {/* Interactive Word Search Matrix with 2-Finger Zoom & Pan */}
      <View
        ref={matrixCardRef}
        onLayout={() => {
          matrixCardRef.current?.measureInWindow((x, y, w, h) => {
            if (w > 0 && h > 0) {
              matrixLayoutRef.current = { x, y, width: w, height: h };
            }
          });
        }}
        style={[
          styles.matrixCard,
          isZoomableLevel
            ? {
                width: windowWidth,
                marginHorizontal: -14,
                height: matrixHeight,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 0,
                borderTopWidth: 1.5,
                borderBottomWidth: 1.5,
                borderLeftWidth: 0,
                borderRightWidth: 0,
                borderTopColor: 'rgba(124, 58, 237, 0.22)',
                borderBottomColor: 'rgba(124, 58, 237, 0.22)',
                backgroundColor: 'transparent',
                paddingHorizontal: 0,
                paddingVertical: 4,
                marginVertical: 4,
              }
            : {
                width: gridSize,
                height: gridSize,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                borderRadius: 0,
                borderWidth: 0,
                backgroundColor: 'transparent',
                marginVertical: 4,
              },
        ]}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={{
            transform: [
              { translateX: panX },
              { translateY: panY },
              { scale: zoomScale },
            ],
          }}
        >
          <View style={[styles.gridContainer, { width: gridSize, height: gridSize }]}>
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
                          width: Math.max(16, tileSize - (isLargeGrid ? 2 : 4)),
                          height: Math.max(16, tileSize - (isLargeGrid ? 2 : 4)),
                          margin: isLargeGrid ? 1 : 2,
                          backgroundColor: tileBg,
                          borderRadius: isLargeGrid ? 6 : 10,
                          elevation: isLargeGrid ? 1 : 3,
                          shadowColor: '#0E1A3A',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 2,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tileLetter,
                          {
                            fontSize: tileFontSize,
                            color: tileColor,
                          },
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
        </Animated.View>
      </View>

      {/* 4 Lifeline Action Power-up Buttons (Single Horizontal Row) */}
      <View style={[styles.actionRow, contentWidthStyle]}>
        {/* Shuffle / Clear */}
        <Pressable
          onPress={handleShuffle}
          style={({ pressed }) => [styles.actionBtn, styles.shuffleBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="refresh" size={18} color="#7C3AED" />
          <Text numberOfLines={1} style={[styles.actionBtnTitle, { color: '#7C3AED' }]}>CLEAR</Text>
          <Text numberOfLines={1} style={[styles.actionBtnSub, { color: '#7C3AED' }]}>Free</Text>
        </Pressable>

        {/* Hint */}
        <Pressable
          onPress={handleHint}
          style={({ pressed }) => [styles.actionBtn, styles.hintBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="lightbulb" size={18} color="#B45309" />
          <Text numberOfLines={1} style={[styles.actionBtnTitle, { color: '#B45309' }]}>HINT</Text>
          <Text numberOfLines={1} style={[styles.actionBtnSub, { color: '#B45309' }]}>
            {hasUsedCoinHint ? 'Ad only' : `🪙 ${HINT_COST}`}
          </Text>
        </Pressable>

        {/* Ad-rewarded hint */}
        <Pressable
          onPress={handleRewardedHint}
          style={({ pressed }) => [styles.actionBtn, styles.adHintBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="ondemand-video" size={18} color="#0284C7" />
          <Text numberOfLines={1} style={[styles.actionBtnTitle, { color: '#0284C7' }]}>AD HINT</Text>
          <Text numberOfLines={1} style={[styles.actionBtnSub, { color: '#0284C7' }]}>🎬 Free</Text>
        </Pressable>

        {/* Reveal */}
        <Pressable
          onPress={handleReveal}
          style={({ pressed }) => [styles.actionBtn, styles.revealBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="auto-fix-high" size={18} color="#0D9488" />
          <Text numberOfLines={1} style={[styles.actionBtnTitle, { color: '#0D9488' }]}>REVEAL</Text>
          <Text numberOfLines={1} style={[styles.actionBtnSub, { color: '#0D9488' }]}>🪙 {REVEAL_COST}</Text>
        </Pressable>
      </View>

      {/* Level Victory Modal with Winged Crest, Golden Sunburst & Party Confetti / Zario Ribbons */}
      <VictoryModal
        visible={isVictory}
        levelId={levelId}
        maxWordStreak={maxWordStreak}
        coinsEarned={Math.round(50 * diffConfig.coinMultiplier)}
        strikeEarned={STRIKE_WIN_REWARD}
        xpEarned={diffConfig.xpReward}
        onNextLevel={() => handleCompleteAttempt('next')}
        onGoToMap={() => handleCompleteAttempt('map')}
      />

      {/* Redesigned Game Paused Modal (WorMind Popup 1) */}
      <GamePausedModal
        visible={isPaused}
        levelId={levelId}
        timeLeft={timeLeft}
        soundEnabled={soundEnabled}
        musicEnabled={musicEnabled}
        hapticsEnabled={hapticsEnabled}
        onToggleSound={toggleSound}
        onToggleMusic={toggleMusic}
        onToggleHaptics={toggleHaptics}
        onResume={handleResume}
        onExit={handleExit}
      />

      {/* Redesigned Game Over Time-Out Modal */}
      <GameOverModal
        visible={isGameOver}
        levelId={levelId}
        strike={strike}
        strikeLost={strikeLost}
        isRestoringStrike={isRestoringStrike}
        lossScaleAnim={lossScaleAnim}
        lossShakeAnim={lossShakeAnim}
        lossHeartAnim={lossHeartAnim}
        lossStrikeAnim={lossStrikeAnim}
        floatMinusOneAnim={floatMinusOneAnim}
        floatMinusOneY={floatMinusOneY}
        onRetry={handleRetry}
        onExit={handleExit}
      />

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
    paddingTop: 4,
    paddingBottom: 65,
  },
  inlineSpelledChip: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C4B5FD',
    maxWidth: 130,
    marginLeft: 6,
  },
  inlineSpelledText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  inlineFoundChip: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5EEAD4',
    maxWidth: 140,
    marginLeft: 6,
  },
  inlineFoundText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F766E',
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
  diffPacingBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginLeft: 4,
  },
  diffPacingBadgePeak: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  diffPacingBadgeRelief: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  diffPacingText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4B5563',
    letterSpacing: 0.2,
  },
  diffPacingTextPeak: {
    color: '#DC2626',
  },
  diffPacingTextRelief: {
    color: '#16A34A',
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
  zoomControlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 420,
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(245, 243, 255, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
  },
  zoomInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoomInfoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  zoomBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoomMiniBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomResetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
  },
  zoomResetText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
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
    gap: 6,
    marginTop: 8,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
    paddingVertical: 3,
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
  adHintBtn: {
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  revealBtn: {
    backgroundColor: '#F0FDFA',
    borderWidth: 2,
    borderColor: '#99F6E4',
  },
  actionBtnTitle: {
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
    textAlign: 'center',
  },
  actionBtnSub: {
    fontSize: 8.5,
    fontWeight: '800',
    textAlign: 'center',
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

