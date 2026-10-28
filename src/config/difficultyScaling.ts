/**
 * ============================================================================
 * WORMIND LEVEL DESIGN & DIFFICULTY SCALING ENGINE
 * ----------------------------------------------------------------------------
 * Core Level Design Architecture:
 * - Endless Level Structure (Level 1 to N)
 * - 4-Level Progressive Climb (Difficulty steadily increases across 4 levels)
 * - Every 5th Level is a Relief / Breather Level (Drops in hardness to ~3rd level)
 * - Continuous Upward Overall Scaling (Next cycle starts higher than previous peak)
 *
 * Reference Graph Curve (Scale 1.0 to 16+):
 * - Level 1: 1.0  (Base Start - Very Easy)
 * - Level 2: 3.5  (Climb)
 * - Level 3: 5.5  (Climb)
 * - Level 4: 7.5  (Peak of Cycle 1)
 * - Level 5: 5.7  (Relief Drop — easier than Level 4, slightly above Level 3)
 * - Level 6: 8.5  (New Climb — starts higher than Level 4's peak by 1.0)
 * - Level 7: 9.5  (Climb)
 * - Level 8: 10.7 (Climb)
 * - Level 9: 12.2 (Peak of Cycle 2)
 * - Level 10: 11.0 (Relief Drop — easier than Level 9, near Level 8)
 * - Level N: Continues this exact [4 Climb + 1 Relief Drop] wave pattern infinitely.
 * ============================================================================
 */

export type CycleStep = 1 | 2 | 3 | 4 | 5;
export type LevelPacingRole = 'climb_start' | 'climb_mid' | 'climb_high' | 'cycle_peak' | 'relief_breather';

export interface LevelDifficultyConfig {
  level: number;
  cycle: number;
  step: CycleStep;
  role: LevelPacingRole;
  hardness: number;
  wordCount: number;
  wordLengthMin: number;
  wordLengthMax: number;
  allowedDirections: number[][];
  timeLimit: number;
  maskShape: 'square' | 'octagon' | 'diamond' | 'cross';
  coinMultiplier: number;
  xpReward: number;
  titleBadge: string;
  pacingDescription: string;
}

// Directions
export const DIR_EASY = [[1, 0], [0, 1]]; // Horizontal Right, Vertical Down
export const DIR_MEDIUM = [[1, 0], [0, 1], [1, 1], [1, -1]]; // + Diagonals Down
export const DIR_ALL_8 = [
  [1, 0], [0, 1], [1, 1], [1, -1],
  [-1, 0], [0, -1], [-1, -1], [-1, 1],
]; // Full 8 directions including backwards & reverse diagonals

/**
 * Exact Hardness Calculator for any level 1 to N
 * Strictly replicates the reference graph curve and scales endlessly.
 */
export function getLevelHardness(level: number): number {
  if (level <= 0) return 2.8;

  // Cycle 0 reference values (Levels 1 to 5)
  // L1 (2.8) and L2 (4.5) upgraded to introduce diagonal intrigue and 5-word depth for curiosity
  const cycle0 = [2.8, 4.5, 5.8, 7.5, 5.7];
  if (level <= 5) return cycle0[level - 1];

  // Cycle 1 reference values (Levels 6 to 10)
  const cycle1 = [8.5, 9.5, 10.7, 12.2, 11.0];
  if (level <= 10) return cycle1[level - 6];

  // Cycle 2 to N (Endless Scaling)
  // Each 5-level cycle advances by 4.7 (Peak 2 [12.2] - Peak 1 [7.5] = 4.7)
  const cycleIndex = Math.floor((level - 1) / 5); // 2 for L11-15, 3 for L16-20, etc.
  const stepIndex = (level - 1) % 5; // 0 to 4
  const cycleGrowth = 4.7;

  const baseValue = cycle1[stepIndex];
  const hardness = baseValue + (cycleIndex - 1) * cycleGrowth;
  return Math.round(hardness * 10) / 10;
}

/**
 * Returns the cycle index (1-based) and step (1 to 5)
 */
export function getCycleInfo(level: number): { cycle: number; step: CycleStep; role: LevelPacingRole } {
  const safeLevel = Math.max(1, Math.floor(level));
  const cycle = Math.floor((safeLevel - 1) / 5) + 1;
  const step = (((safeLevel - 1) % 5) + 1) as CycleStep;

  let role: LevelPacingRole;
  switch (step) {
    case 1:
      role = 'climb_start';
      break;
    case 2:
      role = 'climb_mid';
      break;
    case 3:
      role = 'climb_high';
      break;
    case 4:
      role = 'cycle_peak';
      break;
    case 5:
      role = 'relief_breather';
      break;
  }

  return { cycle, step, role };
}

/**
 * Maps the Hardness value directly to game variables for any level 1 to N.
 */
export function getLevelDifficultyConfig(level: number): LevelDifficultyConfig {
  const safeLevel = Math.max(1, Math.floor(level));
  const hardness = getLevelHardness(safeLevel);
  const { cycle, step, role } = getCycleInfo(safeLevel);

  // 1. Word Count mapping (5 to 8 words)
  // Relief levels (step 5) drop word count by 1 compared to the peak (step 4)
  let wordCount: number;
  if (hardness < 7.0) {
    wordCount = step === 5 ? 4 : 5;
  } else if (hardness < 10.0) {
    wordCount = step === 5 ? 5 : 6;
  } else if (hardness < 13.0) {
    wordCount = step === 5 ? 5 : (step === 4 ? 7 : 6);
  } else if (hardness < 17.0) {
    wordCount = step === 5 ? 6 : (step === 4 ? 8 : 7);
  } else {
    // Ultra high endless levels
    wordCount = step === 5 ? 7 : 8;
  }

  // 2. Word Lengths (Min and Max)
  let wordLengthMin = 3;
  let wordLengthMax = 5;
  if (hardness >= 4.0 && hardness < 7.5) {
    wordLengthMin = 4;
    wordLengthMax = 6;
  } else if (hardness >= 7.5 && hardness < 11.0) {
    wordLengthMin = 4;
    wordLengthMax = 6;
  } else if (hardness >= 11.0) {
    wordLengthMin = 4;
    wordLengthMax = 7;
  }

  // 3. Allowed Directions
  let allowedDirections = DIR_EASY;
  if (hardness >= 2.5 && hardness < 8.0) {
    // Level 1 (2.8) and Level 2 (4.5) use DIR_MEDIUM so players discover diagonals early!
    allowedDirections = step === 5 ? DIR_EASY : DIR_MEDIUM;
  } else if (hardness >= 8.0) {
    // Step 5 relief levels in high cycles drop to MEDIUM directions for relief
    allowedDirections = step === 5 ? DIR_MEDIUM : DIR_ALL_8;
  }

  // 4. Timer / Time Limit Calculation
  // Base time per word scales down as hardness increases, but Step 5 gets a generous breather buffer (+15s)
  let baseSecondsPerWord = 22 - Math.min(8, hardness * 0.45);
  if (step === 5) {
    // Relief Breather: generous extra time
    baseSecondsPerWord += 4.0;
  } else if (step === 4) {
    // Peak Level: intense rush
    baseSecondsPerWord -= 1.5;
  }
  const rawTime = Math.round(wordCount * baseSecondsPerWord);
  const timeLimit = Math.max(50, Math.min(130, rawTime));

  // 5. Grid Mask / Shape
  let maskShape: 'square' | 'octagon' | 'diamond' | 'cross' = 'square';
  if (step === 5) {
    // Relief levels use friendly open geometry
    maskShape = 'square';
  } else if (step === 4) {
    // Peak levels use complex clipped geometry
    maskShape = hardness >= 12.0 ? 'cross' : 'diamond';
  } else if (step === 3) {
    maskShape = 'octagon';
  } else {
    maskShape = hardness < 6.0 ? 'square' : 'octagon';
  }

  // 6. Rewards Scaling
  let coinMultiplier = 1.0;
  let xpReward = 100;
  if (step === 4) {
    // Peak Level bonus
    coinMultiplier = 1.5;
    xpReward = 150;
  } else if (step === 5) {
    // Breather reward
    coinMultiplier = 1.1;
    xpReward = 110;
  }

  // 7. Badges and Pacing description
  let titleBadge = '';
  let pacingDescription = '';
  switch (step) {
    case 1:
      titleBadge = `CYC ${cycle} • CLIMB START`;
      pacingDescription = `Cycle ${cycle} Ascent Begins — Hardness: ${hardness.toFixed(1)}`;
      break;
    case 2:
      titleBadge = `CYC ${cycle} • CLIMB`;
      pacingDescription = `Stepping Up — Hardness: ${hardness.toFixed(1)}`;
      break;
    case 3:
      titleBadge = `CYC ${cycle} • HIGH CLIMB`;
      pacingDescription = `Approaching Peak — Hardness: ${hardness.toFixed(1)}`;
      break;
    case 4:
      titleBadge = `🔥 CYCLE ${cycle} PEAK`;
      pacingDescription = `Cycle Peak Challenge — Hardness: ${hardness.toFixed(1)}`;
      break;
    case 5:
      titleBadge = `🌿 CYCLE ${cycle} RELIEF`;
      pacingDescription = `Breather Level — Relaxed Pace (Hardness: ${hardness.toFixed(1)})`;
      break;
  }

  return {
    level: safeLevel,
    cycle,
    step,
    role,
    hardness,
    wordCount,
    wordLengthMin,
    wordLengthMax,
    allowedDirections,
    timeLimit,
    maskShape,
    coinMultiplier,
    xpReward,
    titleBadge,
    pacingDescription,
  };
}
