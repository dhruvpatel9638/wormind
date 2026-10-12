import { DAILY_REWARDS } from '../data/gameData';
import { SPIN_PRIZES } from '../data/spinPrizes';
import type { PlayerState, SpinTicket } from '../types';

export const localDayKey = (date = new Date()): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function previousDayKey(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return localDayKey(yesterday);
}

export function millisecondsToNextDay(date = new Date()): number {
  const next = new Date(date);
  next.setHours(24, 0, 0, 0);
  return Math.max(1, next.getTime() - date.getTime());
}

export function createInitialPlayerState(): PlayerState {
  return {
    coins: 100, xp: 0, stars: 380, hearts: 5, maxHearts: 5, heartSeconds: 252,
    streak: 0, streakLvl: 2, streakMax: 7, claimedDays: [], hasClaimedDay5: false,
    equippedHat: 'none', unlockedHats: ['none', 'sunglasses'],
    solvedCount: 23, wordsDiscovered: 148,
    soundEnabled: true, musicEnabled: true, hapticsEnabled: true,
    currentLevel: 1, lastDailyClaimDate: null, lastSpinDate: null, pendingSpin: null,
    strike: 10, strikeZeroFails: 0,
  };
}

const nonnegative = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;

function savedDay(value: unknown): string | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  return localDayKey(new Date(year, month - 1, day)) === value ? value : null;
}

export function restorePlayerState(value: unknown): PlayerState {
  const defaults = createInitialPlayerState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults;
  const saved = value as Partial<PlayerState>;
  const lastDailyClaimDate = savedDay(saved.lastDailyClaimDate);
  // Old installations started with four demo claims but no actual claim date.
  // Remove those placeholders without resetting legitimate dated progress.
  const claimedDays: number[] = [];
  if (lastDailyClaimDate && Array.isArray(saved.claimedDays)) {
    for (let day = 1; day <= 7 && saved.claimedDays.includes(day); day++) claimedDays.push(day);
  }
  const pending = saved.pendingSpin;
  const pendingSpin = pending && typeof pending.id === 'string' && pending.id.length > 0
    && savedDay(pending.date) && Number.isInteger(pending.prizeIndex)
    && pending.prizeIndex >= 0 && pending.prizeIndex < SPIN_PRIZES.length ? pending : null;
  return {
    ...defaults, ...saved,
    coins: nonnegative(saved.coins, defaults.coins),
    xp: nonnegative(saved.xp, 0),
    currentLevel: Math.max(1, nonnegative(saved.currentLevel, 1)),
    strike: nonnegative(saved.strike, defaults.strike),
    strikeZeroFails: nonnegative(saved.strikeZeroFails, 0),
    unlockedHats: Array.isArray(saved.unlockedHats)
      ? [...new Set(['none', ...saved.unlockedHats.filter((hat) => typeof hat === 'string')])]
      : defaults.unlockedHats,
    claimedDays, lastDailyClaimDate, lastSpinDate: savedDay(saved.lastSpinDate), pendingSpin,
    streak: lastDailyClaimDate ? nonnegative(saved.streak, 0) : 0,
    hasClaimedDay5: claimedDays.includes(5),
  };
}

export function rewardAvailability(state: PlayerState, now = new Date()) {
  const today = localDayKey(now);
  // A clock rollback must not reopen an already-claimed day.
  const canClaimDaily = !state.lastDailyClaimDate || state.lastDailyClaimDate < today;
  const canSpinToday = !state.lastSpinDate || state.lastSpinDate < today;
  const claimedDays = state.claimedDays.length >= 7 && canClaimDaily ? [] : state.claimedDays;
  const streak = state.lastDailyClaimDate === today || state.lastDailyClaimDate === previousDayKey(now)
    ? state.streak : 0;
  return { canClaimDaily, canSpinToday, claimedDays, currentDay: (claimedDays.length % 7) + 1, streak };
}

export function claimDailyReward(state: PlayerState, day: number, now = new Date()): PlayerState {
  const available = rewardAvailability(state, now);
  if (!available.canClaimDaily || day !== available.currentDay) return state;
  const reward = DAILY_REWARDS.find((entry) => entry.day === day);
  if (!reward) return state;
  const claimedDays = [...available.claimedDays, day];
  return {
    ...state,
    coins: state.coins + reward.coins,
    unlockedHats: reward.hat ? [...new Set([...state.unlockedHats, reward.hat])] : state.unlockedHats,
    claimedDays, lastDailyClaimDate: localDayKey(now), hasClaimedDay5: claimedDays.includes(5),
    streak: state.lastDailyClaimDate === previousDayKey(now) ? state.streak + 1 : 1,
  };
}

export function startDailySpin(state: PlayerState, now = new Date(), random = Math.random()): PlayerState {
  if (!rewardAvailability(state, now).canSpinToday || state.pendingSpin) return state;
  const prizeIndex = Math.min(SPIN_PRIZES.length - 1, Math.max(0, Math.floor(random * SPIN_PRIZES.length)));
  return {
    ...state,
    pendingSpin: { id: `${now.getTime()}-${prizeIndex}`, date: localDayKey(now), prizeIndex },
  };
}

export function completeDailySpin(state: PlayerState, ticket: SpinTicket, now = new Date()): PlayerState {
  const pending = state.pendingSpin;
  if (!pending || pending.id !== ticket.id || pending.date !== ticket.date
    || pending.prizeIndex !== ticket.prizeIndex || !rewardAvailability(state, now).canSpinToday) return state;
  const prize = SPIN_PRIZES[pending.prizeIndex];
  if (!prize) return state;
  // Coins and the daily lock are committed together, only after a completed
  // animation. An interrupted spin keeps its prize for the next attempt.
  return { ...state, coins: state.coins + prize.amount, lastSpinDate: localDayKey(now), pendingSpin: null };
}

export function spendHint(state: PlayerState): PlayerState {
  if (state.coins >= 25) return { ...state, coins: state.coins - 25 };
  return state;
}
