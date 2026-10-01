import fs from 'fs';

const THEMES = [
  {
    themeIcon: 'wb_sunny',
    world: 'island',
    words: ['SUN', 'DAY', 'SKY', 'WARM', 'HEAT', 'LIGHT', 'RAY', 'SHINE', 'BRIGHT', 'GLOW', 'BEACH', 'SAND', 'WAVE', 'SURF', 'TIDE']
  },
  {
    themeIcon: 'local_florist',
    world: 'island',
    words: ['ROSE', 'LEAF', 'BIRD', 'TREE', 'BLOOM', 'FLOWER', 'STEM', 'ROOT', 'SEED', 'PETAL', 'VINE', 'BUSH', 'FERN', 'MOSS', 'PINE']
  },
  {
    themeIcon: 'psychology',
    world: 'boulevard',
    words: ['MIND', 'LOGIC', 'THINK', 'SMART', 'BRAIN', 'IDEA', 'FOCUS', 'PUZZLE', 'GENIUS', 'CLEVER', 'WISE', 'LEARN', 'STUDY', 'SOLVE']
  },
  {
    themeIcon: 'rocket',
    world: 'space', // assuming 'space' is a valid world, or just use 'boulevard'
    words: ['SPACE', 'MOON', 'MARS', 'STAR', 'SHIP', 'ORBIT', 'COMET', 'ALIEN', 'GALAXY', 'PLANET', 'EARTH', 'VENUS', 'PLUTO', 'SUN']
  },
  {
    themeIcon: 'sailing',
    world: 'island',
    words: ['BOAT', 'SHIP', 'SAIL', 'WIND', 'SEA', 'OCEAN', 'WATER', 'WAVE', 'FISH', 'SHARK', 'WHALE', 'CRAB', 'GULL', 'DEEP', 'TIDE']
  }
];

// 8 directions: [dx, dy]
const DIRS = {
  easy: [[1, 0], [0, 1]], // Right, Down
  medium: [[1, 0], [0, 1], [1, 1], [1, -1]], // Right, Down, Diagonals right
  hard: [[1, 0], [0, 1], [1, 1], [1, -1], [-1, 0], [0, -1], [-1, -1], [-1, 1]] // All 8
};

const MASKS = {
  octagon: [
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' ']
  ],
  diamond: [
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', '#', '#', '#', '#', '#', '#', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', ' ', '#', '#', ' ', ' ', ' ']
  ],
  cross: [
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    [' ', ' ', '#', '#', '#', '#', ' ', ' '],
    [' ', ' ', '#', '#', '#', '#', ' ', ' ']
  ],
  square: [
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#']
  ]
};

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateGrid(words, difficulty, maskName) {
  const SIZE = 8;
  const mask = MASKS[maskName];
  
  let grid = Array(SIZE).fill(null).map((_, r) => 
    Array(SIZE).fill(null).map((_, c) => mask[r][c] === '#' ? ' ' : '-')
  );
  let targetWords = [];
  
  const allowedDirs = DIRS[difficulty];
  
  for (let word of words) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 200) {
      attempts++;
      const dir = allowedDirs[randomInt(allowedDirs.length)];
      const dx = dir[0];
      const dy = dir[1];
      
      const startX = randomInt(SIZE);
      const startY = randomInt(SIZE);
      
      let endX = startX + dx * (word.length - 1);
      let endY = startY + dy * (word.length - 1);
      
      if (endX >= 0 && endX < SIZE && endY >= 0 && endY < SIZE) {
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const char = grid[startY + dy * i][startX + dx * i];
          if (char !== ' ' && char !== word[i]) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            grid[startY + dy * i][startX + dx * i] = word[i];
          }
          targetWords.push({
            word: word,
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
  
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === ' ') {
        grid[r][c] = ALPHABET[randomInt(ALPHABET.length)];
      } else if (grid[r][c] === '-') {
        grid[r][c] = ' ';
      }
    }
  }
  
  return { grid, targetWords };
}

const levels = [];
const MASK_KEYS = ['square', 'octagon', 'diamond', 'cross'];

for (let i = 1; i <= 50; i++) {
  let difficulty = 'medium';
  if (i === 1 || i === 5) difficulty = 'easy';
  else if (i === 4 || i % 5 === 0) difficulty = 'hard';
  else if (i < 10) difficulty = 'easy';
  
  // Pick theme
  const theme = THEMES[i % THEMES.length];
  
  // Pick mask based on level ID to ensure variety
  const maskName = MASK_KEYS[i % MASK_KEYS.length];
  
  // Pick 4-5 words
  const numWords = difficulty === 'hard' ? 6 : (difficulty === 'easy' ? 4 : 5);
  const selectedWords = shuffle([...theme.words]).slice(0, numWords);
  
  // Generate
  let result = generateGrid(selectedWords, difficulty, maskName);
  
  // Keep trying if we couldn't place all words
  let tries = 0;
  while (result.targetWords.length < selectedWords.length - 1 && tries < 10) {
    result = generateGrid(selectedWords, difficulty, maskName);
    tries++;
  }
  
  levels.push({
    id: i,
    title: `Level ${i}`,
    subtitle: `${theme.world.toUpperCase()} - ${difficulty.toUpperCase()}`,
    world: theme.world,
    themeIcon: theme.themeIcon,
    stars: 0,
    completed: i === 1 ? false : false, // all start incomplete by default, user can play
    locked: false,
    grid: result.grid,
    targetWords: result.targetWords
  });
}

const fileContent = `import { LevelData } from '../types';

export const GENERATED_LEVELS: LevelData[] = ${JSON.stringify(levels, null, 2)};
`;

fs.writeFileSync('./src/data/generatedLevels.ts', fileContent);
console.log('Successfully generated 50 levels to src/data/generatedLevels.ts');
