import { DailyReward, LevelData } from '../types';

export const ASSETS = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1Uq3xUGyLLE-N95K360Flqq1vo-7zHCkMewXKnFVNYBQwiNph3vOhfFZzi5VHyUQuZ7pDLQFhy5laJEkfINHObo8I-A2_ObqF2BbtiN1VHQzC3XgC0kZQA2mTcuBu_0zN9hDHkzlptwwwWOLvMcVb1scqe_tp_P9QnsXOk-jvoGK8_G_GySFw-ZWyHtrNQJiLl0T-7Az1p-h1kpR4cPkQM0g5XtZ4HiGG78hDNLsNabgz0bdeGStqQJgpI',
  brainBoulevard: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIZEJHJmrOjTII9p1XibdaZs1VtbvEaMAq6e-vZIo6xqKvNRPBxP99IkD66PxYLXrgSq8M_jMjZl6r-7QTDZJuEOjdYBVX-48ez2y3C5VqVtgdbzIxuDfWHOjPw5MIEERpJZmZz2Y4NEPYgs44-4pr5036ariWGMZE5NRKs-acj-1PvL94Pg091DHaaYDDrT6f59Z-5gWohmRYHAFQJkGy-tJkFKTHRimv5vaBQeARHwerPajk-z6Q',
  dreamyIsland: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx9FZ90vBpZKZUKOKnVttti4YpuYc3EOuai1tvip1Ld3k1DlJlj0h5jO9eJlwp_NKMFHdsgFpmVvN8fHONGrv75AOoudE5zCDpHMY3LLSELOS0KhQeAErQfTku85e5wd8vbSse6Mip5L-SQe1NZKUV20K4BK57rqkEDVQUErxlktRb6MPVGKo2daLnwIncX2DsEA6mAY3OpXoF7lhefHdgKOxiFF0bCRzFxrUs7WvhFpZ2fFhtD-cg',
  wordForest: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBW3klXIAbOxQuX7lRAonw6LMXV24Here4gtxsFDU9njl5QuUAVKBHYtX9eo_YaMSVAAhuc2GVY2U7wdcKtIEj7kPa50q0qg-B2AtgI8g-mwzErWiswKomYbC1BgiR3aVXm4dojPwYmuT60cMWLznvvIt-x2IjQmEM8vOZu5V5LKO-hridd4JJLEQ9Pe1giFUmTy6xjqJgB9eRbG88CWh8w0_pZAVjozEhdOTN1793SGUqLG-cz4uCq',
  lokiDaily: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8ekWIcaJel-x97JGQo9ZVBJPE9wB4xfaRYzwZURhDyZCTbmguhGWRGaVSpgm0c9j7r4huyUaoPn1XQ7U9RBCvEzEYqX64NClkNUHVbWBpcGbF5rUht5iQ5ZO-lphkCX88qWjQbTjviK_NpvWe2pApXNU7HQIg4LKYjSKvx4hevlhF8Taok_ePrN0LMvJmw-DuIwFonrKGnNs4_saq2Fu8OLAkxL0YCU4EOx_MP4RYVQ2Y909LVO9i',
  ultraChest: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDDxynRosZIBBJImr-QYsJf-XrgpC4sXXvxFpDTilOqVrr5yCEek59kymLr8c-9hHFUB-u4slrOvj8G6wBAeS4fmRfyRp1bScQYlpjRYxCu7hyLQNruyDT70JagBTlQD3cbOHGpO9XMJTFY6J-9Mo0-3Q_qVX-zjcOG9U8kDLofsUkvBUGRy9Ne_8p476gihvRjg9NyRvWquU1fZCbumCDS9om-0rPxJA4948RiI3chBgWAANTz9W3x',
};

// Exact Level 24 Beach Day Grid from provided HTML and image
export const LEVEL_24_GRID: string[][] = [
  [' ', 'B', 'E', 'A', 'C', 'H', ' ', ' '],
  [' ', ' ', 'S', 'U', 'N', 'Y', ' ', ' '],
  ['X', 'W', 'A', 'V', 'E', 'F', 'G', 'H'],
  ['Z', 'O', 'C', 'E', 'A', 'N', 'L', 'K'],
  ['S', 'H', 'E', 'L', 'L', 'P', 'W', 'O'],
  [' ', 'T', 'O', 'W', 'E', 'L', 'A', ' '],
  [' ', ' ', 'B', 'F', 'X', 'C', ' ', ' '],
  [' ', ' ', ' ', 'E', 'Q', ' ', ' ', ' '],
];

import { GENERATED_LEVELS } from './generatedLevels';
import { OCEAN_LEVELS } from './oceanLevels';

export const INITIAL_LEVELS: LevelData[] = [...GENERATED_LEVELS, ...OCEAN_LEVELS];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, rewardText: '+50 Coins', coins: 50, hints: 0, status: 'claimed' },
  { day: 2, rewardText: '+80 Coins', coins: 80, hints: 0, status: 'claimed' },
  { day: 3, rewardText: '1 Hint Bulb', coins: 0, hints: 1, status: 'claimed' },
  { day: 4, rewardText: '+100 Coins', coins: 100, hints: 0, status: 'claimed' },
  { day: 5, rewardText: '+150 Coins + 2 Hints', coins: 150, hints: 2, status: 'ready' },
  { day: 6, rewardText: '+200 Coins + 50 XP', coins: 200, hints: 0, xp: 50, status: 'locked' },
  { day: 7, rewardText: 'Ultra Word Chest (+500 Coins, 300 XP, Loki Hat)', coins: 500, hints: 3, xp: 300, isJackpot: true, status: 'locked' },
];

export const LOKI_QUOTES = [
  'Ready when you are, Captain Loki!',
  'I spot "OCEAN" swimming across row 4!',
  'Look horizontally in row 5 for "SHELL"!',
  'Did you know? Word puzzles stimulate synaptic plasticity!',
  'Keep the 5-day streak blazing for that weekend Mega Chest!',
  'Super work! Your vocabulary is truly out of this orbit!',
  'Need a breeze? Try the SHUFFLE button to reset your eyes!',
];

export const VOCABULARY_JOURNAL = [
  { word: 'LUMINESCENT', definition: 'Emitting light not caused by heat; glowing like deep sea coral.', world: 'Bubble Ocean' },
  { word: 'ARCHIPELAGO', definition: 'A group or chain of scattered tropical islands.', world: 'Dreamy Island' },
  { word: 'CHLOROPHYLL', definition: 'The green pigment in plants that captures sunlight for nourishment.', world: 'Word Forest' },
  { word: 'EUPHORIA', definition: 'A feeling or state of intense excitement and happiness.', world: 'Brain Boulevard' },
  { word: 'PETRICHOR', definition: 'A pleasant earthy smell that frequently accompanies the first rain.', world: 'Word Forest' },
  { word: 'SOLSTICE', definition: 'When the sun reaches its highest or lowest point in the sky at noon.', world: 'Sunny Valley' },
];
