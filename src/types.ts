export type Screen = 'worlds' | 'game' | 'daily' | 'profile';

export interface TargetWord {
  word: string;
  found: boolean;
  rowStart: number;
  colStart: number;
  rowEnd: number;
  colEnd: number;
  clue?: string;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  world: 'boulevard' | 'island' | 'forest' | 'space';
  themeIcon: string;
  grid: string[][];
  targetWords: TargetWord[];
  stars: number;
  completed: boolean;
  locked: boolean;
}

export interface PlayerState {
  coins: number;
  stars: number;
  hearts: number;
  maxHearts: number;
  heartSeconds: number;
  streak: number;
  streakLvl: number;
  streakMax: number;
  claimedDays: number[];
  hasClaimedDay5: boolean;
  hintsAvailable: number;
  equippedHat: 'none' | 'explorer' | 'crown' | 'sunglasses';
  unlockedHats: string[];
  solvedCount: number;
  wordsDiscovered: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  currentLevel?: number;
  lastDailyClaimDate?: string | null;
  strike: number;
}

export interface DailyReward {
  day: number;
  rewardText: string;
  coins: number;
  hints: number;
  xp?: number;
  isJackpot?: boolean;
  status: 'claimed' | 'ready' | 'locked';
}
