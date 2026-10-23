import { INITIAL_LEVELS } from '../data/gameData';
import { LevelData, TargetWord } from '../types';
import { getLevelDifficultyConfig, LevelDifficultyConfig } from '../config/difficultyScaling';

// Seeded PRNG for deterministic level generation past level 150
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ENDLESS_WORD_BANK = [
  'AURORA', 'NEBULA', 'GALAXY', 'COSMIC', 'ORBIT', 'PLANET', 'SOLAR', 'LUNAR',
  'STELLAR', 'METEOR', 'COMET', 'ECLIPSE', 'HORIZON', 'CRYSTAL', 'DIAMOND', 'SAPPHIRE',
  'EMERALD', 'RUBY', 'AMETHYST', 'QUARTZ', 'VORTEX', 'PORTAL', 'QUANTUM', 'GRAVITY',
  'ENERGY', 'SPECTRUM', 'PHOTON', 'PULSAR', 'CHRONO', 'SPHERE', 'VERTEX', 'MATRIX',
  'INFINITY', 'TRIUMPH', 'VICTORY', 'LEGEND', 'MYTHIC', 'SUPREME', 'VALIANT', 'SHADOW',
  'BEACON', 'PHOENIX', 'DRAGON', 'KNIGHT', 'PALACE', 'CASTLE', 'TEMPLE', 'SUMMIT',
  'GLACIER', 'VOLCANO', 'CANYON', 'ABYSS', 'TRENCH', 'REEFS', 'ISLAND', 'JUNGLE',
  'VALLEY', 'MEADOW', 'FOREST', 'STREAM', 'CASCADE', 'BREEZE', 'ZEPHYR', 'SUNSET',
  'SUNRISE', 'RADIANT', 'BRILLIANT', 'GLOWING', 'SPARKLE', 'SHIMMER', 'MYSTIC', 'ENIGMA'
];

const MASKS: Record<string, number[][]> = {
  square: [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  octagon: [
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
  ],
  diamond: [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
  ],
  cross: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
  ],
};

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function generateEndlessLevel(levelId: number): LevelData {
  const conf: LevelDifficultyConfig = getLevelDifficultyConfig(levelId);
  const rand = mulberry32(levelId * 7919 + 1013);

  // Filter candidates by word length
  const eligibleWords = ENDLESS_WORD_BANK.filter(
    (w) => w.length >= conf.wordLengthMin && w.length <= conf.wordLengthMax
  );

  // Pick candidate words using seeded rand
  const shuffledWords = [...eligibleWords].sort(() => rand() - 0.5);
  const targetWordCount = Math.min(conf.wordCount, shuffledWords.length);
  const candidateWords = shuffledWords.slice(0, targetWordCount);

  const maskPattern = MASKS[conf.maskShape] || MASKS.square;
  const SIZE = 8;

  let bestGrid: string[][] = Array(SIZE).fill(null).map(() => Array(SIZE).fill(' '));
  let bestTargetWords: TargetWord[] = [];

  for (let attempt = 0; attempt < 15; attempt++) {
    const grid: string[][] = Array(SIZE)
      .fill(null)
      .map((_, r) =>
        Array(SIZE)
          .fill(null)
          .map((_, c) => (maskPattern[r][c] === 1 ? ' ' : '-'))
      );

    const placedWords: TargetWord[] = [];

    for (const word of candidateWords) {
      let placed = false;
      for (let tries = 0; tries < 60 && !placed; tries++) {
        const dir = conf.allowedDirections[Math.floor(rand() * conf.allowedDirections.length)];
        const [dx, dy] = dir;
        const startX = Math.floor(rand() * SIZE);
        const startY = Math.floor(rand() * SIZE);
        const endX = startX + dx * (word.length - 1);
        const endY = startY + dy * (word.length - 1);

        if (endX >= 0 && endX < SIZE && endY >= 0 && endY < SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const r = startY + dy * i;
            const c = startX + dx * i;
            const char = grid[r][c];
            if (char !== ' ' && char !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              grid[startY + dy * i][startX + dx * i] = word[i];
            }
            placedWords.push({
              word,
              found: false,
              rowStart: startY,
              colStart: startX,
              rowEnd: endY,
              colEnd: endX,
            });
            placed = true;
          }
        }
      }
    }

    if (placedWords.length > bestTargetWords.length) {
      bestTargetWords = placedWords;
      bestGrid = grid.map((row) =>
        row.map((char) => {
          if (char === '-') return ' ';
          if (char === ' ') return ALPHABET[Math.floor(rand() * ALPHABET.length)];
          return char;
        })
      );
    }

    if (bestTargetWords.length === candidateWords.length) break;
  }

  // Mask metadata
  const maskIcons: Record<string, string> = {
    square: '🟩',
    octagon: '🔷',
    diamond: '🔥',
    cross: '⚡',
  };

  return {
    id: levelId,
    title: `Level ${levelId}`,
    subtitle: `${conf.pacingDescription}`,
    world: 'space',
    themeIcon: conf.step === 4 ? 'whatshot' : conf.step === 5 ? 'eco' : 'star',
    maskName: conf.maskShape.charAt(0).toUpperCase() + conf.maskShape.slice(1),
    maskIcon: maskIcons[conf.maskShape] || '⭐',
    stars: 0,
    completed: false,
    locked: false,
    timeLimit: conf.timeLimit,
    grid: bestGrid,
    targetWords: bestTargetWords,
  };
}

/**
 * Universal Level Getter:
 * - Levels 1 to 50: Sunny Valley (Pre-generated with 0-repeat guarantee)
 * - Levels 51 to 150: Bubble Ocean (Pre-generated with 0-repeat guarantee)
 * - Levels 151 to N: Endless Dynamic Scaling (Strictly follows 4-Climb + 1-Relief graph)
 */
export function getLevelById(levelId: number): LevelData {
  const safeId = Math.max(1, Math.floor(levelId));
  if (safeId <= INITIAL_LEVELS.length) {
    const found = INITIAL_LEVELS.find((l) => l.id === safeId);
    if (found) return found;
  }
  return generateEndlessLevel(safeId);
}
