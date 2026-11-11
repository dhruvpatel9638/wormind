const fs = require('fs');

function parseLevels(filePath, varName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const eqIdx = content.indexOf('=', content.indexOf('export const ' + varName));
  const arrayStart = content.indexOf('[', eqIdx);
  const arrayEnd = content.indexOf('];', arrayStart);
  return JSON.parse(content.substring(arrayStart, arrayEnd + 1));
}

function getShapeType(maskName) {
  const m = maskName.toLowerCase();
  if (m === 'square' || m === 'atlantis citadel' || m === 'ocean fish') return 'square';
  if (m === 'cross' || m === 'anchor' || m === 'neptune trident') return 'cross';
  if (m === 'octagon' || m === 'clam shell' || m === 'jellyfish') return 'octagon';
  if (m === 'diamond' || m === 'water drop' || m === 'nautilus spiral') return 'diamond';
  return 'square';
}

function createMask(shape, size) {
  const grid = [];
  const kCorner = Math.floor(size / 4);
  const mid = (size - 1) / 2;
  const maxManhattan = mid + 0.5;

  for (let r = 0; r < size; r++) {
    const row = [];
    for (let c = 0; c < size; c++) {
      let isCell = false;
      if (shape === 'square') {
        isCell = true;
      } else if (shape === 'cross') {
        const inCorner = (r < kCorner || r >= size - kCorner) && (c < kCorner || c >= size - kCorner);
        isCell = !inCorner;
      } else if (shape === 'octagon') {
        const dTL = r + c;
        const dTR = r + (size - 1 - c);
        const dBL = (size - 1 - r) + c;
        const dBR = (size - 1 - r) + (size - 1 - c);
        const cutoff = kCorner;
        isCell = (dTL >= cutoff && dTR >= cutoff && dBL >= cutoff && dBR >= cutoff);
      } else if (shape === 'diamond') {
        const dist = Math.abs(r - mid) + Math.abs(c - mid);
        isCell = dist <= maxManhattan;
      }
      row.push(isCell ? '#' : ' ');
    }
    grid.push(row);
  }
  return grid;
}

const DIRS_ALL_8 = [
  [1, 0], [0, 1], [1, 1], [1, -1],
  [-1, 0], [0, -1], [-1, -1], [-1, 1]
];

function generateLevelGrid(candidateWords, allowedDirs, mask, size) {
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let bestGrid = null;
  let bestTargetWords = [];

  for (let attempt = 0; attempt < 100; attempt++) {
    const grid = Array(size).fill(null).map((_, r) =>
      Array(size).fill(null).map((_, c) => (mask[r][c] === '#' ? ' ' : '-'))
    );
    const placedWords = [];
    const sortedWords = [...candidateWords].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      let tries = 0;
      while (!placed && tries < 400) {
        tries++;
        const dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
        const dx = dir[0];
        const dy = dir[1];
        const startX = Math.floor(Math.random() * size);
        const startY = Math.floor(Math.random() * size);
        const endX = startX + dx * (word.length - 1);
        const endY = startY + dy * (word.length - 1);

        if (endX >= 0 && endX < size && endY >= 0 && endY < size) {
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
              colEnd: endX
            });
            placed = true;
          }
        }
      }
    }

    if (placedWords.length === candidateWords.length) {
      bestTargetWords = placedWords;
      bestGrid = grid.map(row =>
        row.map(char => {
          if (char === '-') return ' ';
          if (char === ' ') return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          return char;
        })
      );
      break;
    }
  }

  if (!bestGrid || bestTargetWords.length !== candidateWords.length) {
    throw new Error(`Failed to place all words: ${bestTargetWords.length}/${candidateWords.length}`);
  }

  // Verification
  for (const tw of bestTargetWords) {
    const dx = tw.colEnd === tw.colStart ? 0 : tw.colEnd > tw.colStart ? 1 : -1;
    const dy = tw.rowEnd === tw.rowStart ? 0 : tw.rowEnd > tw.rowStart ? 1 : -1;
    let spelled = '';
    for (let i = 0; i < tw.word.length; i++) {
      spelled += bestGrid[tw.rowStart + dy * i][tw.colStart + dx * i];
    }
    if (spelled !== tw.word) {
      throw new Error(`Word mismatch for ${tw.word}: got ${spelled}`);
    }
  }

  return { grid: bestGrid, targetWords: bestTargetWords };
}

const SUNNY_MEGA_IDS = [4, 7, 14, 20, 29, 35, 43, 50];
const OCEAN_MEGA_IDS = [56, 67, 74, 81, 86, 93, 102, 110, 119, 126, 133, 144, 150];

console.log('--- REDESIGNING SUNNY VALLEY MEGA LEVELS ---');
const sunny = parseLevels('src/data/generatedLevels.ts', 'GENERATED_LEVELS');

sunny.forEach(lvl => {
  if (SUNNY_MEGA_IDS.includes(lvl.id)) {
    const shape = getShapeType(lvl.maskName);
    const size = lvl.id === 50 ? 14 : 12;
    const mask = createMask(shape, size);
    const words = lvl.targetWords.map(tw => tw.word);
    const res = generateLevelGrid(words, DIRS_ALL_8, mask, size);

    lvl.grid = res.grid;
    lvl.targetWords = res.targetWords;
    lvl.isMegaGrid = true;
    lvl.timeLimit = (lvl.timeLimit || 90) + 45;
    if (!lvl.subtitle.includes('MEGA GRID')) {
      lvl.subtitle = lvl.subtitle.replace(' (H:', ' - MEGA GRID 🔍 (H:');
    }
    console.log(`Level ${lvl.id} [${shape.toUpperCase()}] redesigned as ${size}x${size} mega grid with ${words.length} words.`);
  }
});

fs.writeFileSync('src/data/generatedLevels.ts',
`import { LevelData } from '../types';

export const GENERATED_LEVELS: LevelData[] = ${JSON.stringify(sunny, null, 2)};
`
);

console.log('--- REDESIGNING BUBBLE OCEAN MEGA LEVELS ---');
const ocean = parseLevels('src/data/oceanLevels.ts', 'OCEAN_LEVELS');

ocean.forEach(lvl => {
  if (OCEAN_MEGA_IDS.includes(lvl.id)) {
    const shape = getShapeType(lvl.maskName);
    const size = lvl.id === 150 ? 14 : 12;
    const mask = createMask(shape, size);
    const words = lvl.targetWords.map(tw => tw.word);
    const res = generateLevelGrid(words, DIRS_ALL_8, mask, size);

    lvl.grid = res.grid;
    lvl.targetWords = res.targetWords;
    lvl.isMegaGrid = true;
    lvl.timeLimit = (lvl.timeLimit || 110) + 50;
    if (!lvl.subtitle.includes('MEGA GRID')) {
      lvl.subtitle = lvl.subtitle.replace(' (H:', ' - MEGA GRID 🔍 (H:');
    }
    console.log(`Level ${lvl.id} [${shape.toUpperCase()}] redesigned as ${size}x${size} mega grid with ${words.length} words.`);
  }
});

// Preserve OCEAN_MASKS_INFO
const oceanContent = fs.readFileSync('src/data/oceanLevels.ts', 'utf8');
const masksInfoPart = oceanContent.substring(
  oceanContent.indexOf('export const OCEAN_MASKS_INFO'),
  oceanContent.indexOf('export const OCEAN_LEVELS')
);

fs.writeFileSync('src/data/oceanLevels.ts',
`import { LevelData } from '../types';

${masksInfoPart}export const OCEAN_LEVELS: LevelData[] = ${JSON.stringify(ocean, null, 2)};
`
);

console.log('Successfully redesigned all 21 mega levels across Sunny Valley and Bubble Ocean!');
