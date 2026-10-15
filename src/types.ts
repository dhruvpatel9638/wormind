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
  maskName?: string;
  maskIcon?: string;
  grid: string[][];
  targetWords: TargetWord[];
  stars: number;
  completed: boolean;
  locked: boolean;
  timeLimit?: number;
}

export interface PlayerState {
  coins: number;
  xp?: number;
  stars: number;
  hearts: number;
  maxHearts: number;
  heartSeconds: number;
  streak: number;
  streakLvl: number;
  streakMax: number;
  claimedDays: number[];
  hasClaimedDay5: boolean;
  equippedHat: 'none' | 'explorer' | 'crown' | 'sunglasses';
  unlockedHats: string[];
  solvedCount: number;
  wordsDiscovered: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticsEnabled: boolean;
  currentLevel?: number;
  lastDailyClaimDate?: string | null;
  lastSpinDate?: string | null;
  pendingSpin?: SpinTicket | null;
  strike: number;
  strikeZeroFails?: number;
  claimedChests?: number[];
  hasClaimedCenturyAchievement?: boolean;
}

export interface SpinTicket {
  id: string;
  date: string;
  prizeIndex: number;
}

export interface DailyReward {
  day: number;
  rewardText: string;
  coins: number;
  hat?: string;
  hatLabel?: string;
  isJackpot?: boolean;
  status: 'claimed' | 'ready' | 'locked';
}
