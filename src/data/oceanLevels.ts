import { LevelData, TargetWord } from '../types';

// 15 Ocean-Themed Custom Grid Masks (8x8)
const OCEAN_MASKS: string[][][] = [
  // 0: Clam Shell (શંખ / છીપ)
  [
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
  ],
  // 1: Anchor (લંગર)
  [
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    ['#', ' ', ' ', '#', '#', ' ', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
  ],
  // 2: Water Drop (ટીપું)
  [
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
  ],
  // 3: Ocean Fish (મછલી)
  [
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
  ],
  // 4: Trident (ત્રિશૂળ)
  [
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
  ],
  // 5: Jellyfish (જેલીફિશ)
  [
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
  ],
  // 6: Octopus (ઓક્ટોપસ)
  [
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
  ],
  // 7: Sailboat (સઢ વાળી બોટ)
  [
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
  ],
  // 8: Starfish (સ્ટારફિશ)
  [
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
  ],
  // 9: Sapphire Gem (હીરા રત્ન)
  [
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
  ],
  // 10: Dolphin Arch (ડોલ્ફિન છલાંગ)
  [
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', ' ', ' ', ' ', ' '],
    ['#', '#', '#', '#', ' ', ' ', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', ' ', '#', '#', '#', '#', ' '],
    [' ', ' ', ' ', ' ', '#', '#', ' ', ' '],
  ],
  // 11: Compass Rose (કંપાસ)
  [
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
  ],
  // 12: Atlantis Tower (અટલાન્ટિસ મહેલ)
  [
    ['#', '#', ' ', '#', '#', ' ', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
  ],
  // 13: Coral Tree (કોરલ રીફ વૃક્ષ)
  [
    ['#', '#', ' ', ' ', '#', '#', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
  ],
  // 14: Nautilus Spiral (નૌટીલસ શંખ ચક્ર)
  [
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', '#', '#', '#', ' ', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', ' ', ' ', ' ', ' ', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
  ],
];

export const OCEAN_MASKS_INFO = [
  { name: 'Clam Shell', icon: '🐚' },
  { name: 'Anchor', icon: '⚓' },
  { name: 'Water Drop', icon: '🫧' },
  { name: 'Ocean Fish', icon: '🐟' },
  { name: 'Neptune Trident', icon: '🔱' },
  { name: 'Jellyfish', icon: '🪼' },
  { name: 'Octopus', icon: '🐙' },
  { name: 'Sailboat', icon: '⛵' },
  { name: 'Starfish', icon: '🌟' },
  { name: 'Sapphire Gem', icon: '💎' },
  { name: 'Dolphin Arch', icon: '🐬' },
  { name: 'Compass Rose', icon: '🧭' },
  { name: 'Atlantis Citadel', icon: '🏰' },
  { name: 'Coral Tree', icon: '🪸' },
  { name: 'Nautilus Spiral', icon: '🐚' },
];

// All words are strictly 3 to 8 letters long to fit perfectly in 8x8 grid
const OCEAN_WORD_DICTIONARY = [
  'ATLANTIS', 'TRIDENT', 'PIRATE', 'SHELL', 'OCEAN', 'PEARL', 'SHARK', 'DOLPHIN',
  'BEACON', 'ANCHOR', 'HARBOR', 'TRENCH', 'CORAL', 'TURTLE', 'NAVY', 'TIDE',
  'WAVE', 'REEF', 'FISH', 'SAND', 'PALM', 'GOLD', 'SHIP', 'COVE',
  'JUMP', 'SWIM', 'KING', 'GLOW', 'HEAT', 'TAIL', 'SONG', 'RUIN',
  'CITY', 'DEEP', 'SEAWATER', 'MARINER', 'COMPASS', 'LAGOON', 'PACIFIC', 'ATLANTIC',
  'ANEMONE', 'BARRIER', 'OYSTER', 'FINS', 'CREST', 'ISLAND', 'MARINA', 'VOLCANO',
  'BREAKER', 'SEAGULL', 'MERMAID', 'TEMPLE', 'SPLASH', 'LIGHT', 'BEACH', 'SHORE',
  'SQUID', 'BEACON', 'SEAWEED', 'SONAR', 'CLOWN', 'SPONGE', 'DIVING', 'GIANT',
  'WHALE', 'NORTH', 'CAVE', 'BOARD', 'CROWN', 'DOCK', 'DIVE', 'MASK',
  'HOLE', 'SURF', 'RIDE', 'PEAK', 'TROPIC', 'ABYSS', 'ROYAL', 'MARITIME',
  'NAUTICAL', 'MUTINY', 'FLOAT', 'FLOAT', 'ISLET', 'REEF', 'CRAB', 'VALLEY'
];

// 8 Directions for HARD difficulty: [dx, dy]
const DIRS_HARD = [
  [1, 0],   // Right
  [0, 1],   // Down
  [1, 1],   // Diagonal Down-Right
  [1, -1],  // Diagonal Up-Right
  [-1, 0],  // Left (Reverse)
  [0, -1],  // Up (Reverse)
  [-1, -1], // Diagonal Up-Left (Reverse)
  [-1, 1],  // Diagonal Down-Left (Reverse)
];

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateCleanOceanLevel(id: number, maskIndex: number): LevelData {
  const mask = OCEAN_MASKS[maskIndex % OCEAN_MASKS.length];
  const maskInfo = OCEAN_MASKS_INFO[maskIndex % OCEAN_MASKS_INFO.length];
  const SIZE = 8;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let bestGrid: string[][] = [];
  let bestTargetWords: TargetWord[] = [];
  let maxPlaced = -1;

  // Try generating up to 20 times to place max valid target words
  for (let attempt = 0; attempt < 20; attempt++) {
    const grid: string[][] = Array(SIZE).fill(null).map((_, r) =>
      Array(SIZE).fill(null).map((_, c) => (mask[r][c] === '#' ? ' ' : '-'))
    );

    const candidateWords = shuffleArray(OCEAN_WORD_DICTIONARY).slice(0, 8);
    const placedWords: TargetWord[] = [];

    for (const word of candidateWords) {
      if (word.length > 8) continue;

      let placed = false;
      let wordTries = 0;

      while (!placed && wordTries < 150) {
        wordTries++;
        const dir = DIRS_HARD[Math.floor(Math.random() * DIRS_HARD.length)];
        const dx = dir[0];
        const dy = dir[1];

        const startX = Math.floor(Math.random() * SIZE);
        const startY = Math.floor(Math.random() * SIZE);

        const endX = startX + dx * (word.length - 1);
        const endY = startY + dy * (word.length - 1);

        if (endX >= 0 && endX < SIZE && endY >= 0 && endY < SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const r = startY + dy * i;
            const c = startX + dx * i;
            const char = grid[r][c];

            // Must be on valid mask cell AND either empty or matching exact character
            if (char !== ' ' && char !== word[i]) {
              canPlace = false;
              break;
            }
          }

          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const r = startY + dy * i;
              const c = startX + dx * i;
              grid[r][c] = word[i];
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

      if (placedWords.length >= 5) break;
    }

    if (placedWords.length > maxPlaced) {
      maxPlaced = placedWords.length;
      bestTargetWords = placedWords;

      // Fill valid mask spaces with random letters, non-mask spaces with ' '
      bestGrid = grid.map((row, r) =>
        row.map((char, c) => {
          if (char === '-') return ' ';
          if (char === ' ') return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          return char;
        })
      );
    }

    if (maxPlaced >= 4) break;
  }

  // Double-check verification: Ensure every targetWord is 100% correctly spelled in grid
  const verifiedWords = bestTargetWords.filter((tw) => {
    const dr = tw.rowEnd === tw.rowStart ? 0 : tw.rowEnd > tw.rowStart ? 1 : -1;
    const dc = tw.colEnd === tw.colStart ? 0 : tw.colEnd > tw.colStart ? 1 : -1;
    let spelled = '';
    for (let i = 0; i < tw.word.length; i++) {
      const r = tw.rowStart + i * dr;
      const c = tw.colStart + i * dc;
      spelled += bestGrid[r]?.[c] || '';
    }
    return spelled === tw.word;
  });

  return {
    id,
    title: `Level ${id}`,
    subtitle: id === 200 ? 'ATLANTIS SUMMIT - HARD' : `BUBBLE OCEAN - HARD ${id - 100}`,
    world: 'island',
    themeIcon: id === 200 ? 'emoji_events' : 'water_drop',
    maskName: maskInfo.name,
    maskIcon: maskInfo.icon,
    stars: 0,
    completed: false,
    locked: false,
    grid: bestGrid,
    targetWords: verifiedWords,
  };
}

export const OCEAN_LEVELS: LevelData[] = Array.from({ length: 100 }, (_, idx) => {
  const lvlId = 101 + idx;
  return generateCleanOceanLevel(lvlId, idx);
});
