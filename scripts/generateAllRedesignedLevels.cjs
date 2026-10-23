const fs = require('fs');

// ==========================================
// 1. EXPANDED SUNNY VALLEY VOCABULARY (350+ words)
// ==========================================
const SUNNY_WORDS = [
  // Garden & Flora
  'ROSE', 'TULIP', 'DAISY', 'ORCHID', 'LOTUS', 'BLOOM', 'PETAL', 'LEAF', 'STEM', 'ROOT',
  'SEED', 'VINE', 'BUSH', 'FERN', 'MOSS', 'PINE', 'OAK', 'ELM', 'CEDAR', 'BIRCH',
  'MAPLE', 'WILLOW', 'POPLAR', 'BAMBOO', 'JASMINE', 'VIOLET', 'LILY', 'IRIS', 'POPPY', 'CLOVER',
  'SPROUT', 'ACORN', 'BLOSSOM', 'MEADOW', 'GROVE', 'TIMBER', 'CANOPY', 'FOLIAGE', 'BRANCH', 'BARK',
  'TWIG', 'FLOWER', 'GARDEN', 'PLANT', 'HERB', 'MINT', 'REED', 'LAWN', 'SWEET', 'SHRUB',
  'BLADE', 'POLLEN', 'NECTAR', 'FLORA', 'BOTANY', 'NURSERY', 'FLORET', 'BOUGH', 'WOODS', 'HEATHER',
  'DAHLIA', 'PEONY', 'AZALEA', 'CARROT', 'RADISH', 'PUMPKIN', 'TOMATO', 'POTATO', 'GARLIC', 'ONION',
  'PEPPER', 'BASIL', 'THYME', 'SAGE', 'PARSLEY', 'ROSEMARY', 'CLOVE', 'GINGER', 'NUTMEG', 'VANILLA',

  // Wildlife & Forest
  'BIRD', 'DEER', 'WOLF', 'FOX', 'HAWK', 'EAGLE', 'SWAN', 'DOVE', 'OWL', 'DUCK',
  'FROG', 'OTTER', 'BADGER', 'RABBIT', 'BEAVER', 'ROBIN', 'HERON', 'RAVEN', 'FINCH', 'FALCON',
  'CONDOR', 'SWALLOW', 'CANARY', 'OSPREY', 'CRICKET', 'FIREFLY', 'BEETLE', 'MOTH', 'SQUIRREL', 'MOOSE',
  'BADGER', 'BOAR', 'WEASEL', 'FERRET', 'HEDGEHOG', 'CHIPMUNK', 'MAGPIE', 'WOODPECK', 'SPARROW', 'LARK',
  'THRUSH', 'WARBLER', 'STARLING', 'PHEASANT', 'GROUSE', 'PARTRIDGE', 'QUAIL', 'MALLARD', 'CYGNET', 'FAWN',
  'BEAR', 'CUB', 'BADGER', 'HORSE', 'PONY', 'COLT', 'STAG', 'DOE', 'HOUND', 'PUPPY',

  // Weather, Sun & Sky
  'SUN', 'RAY', 'SKY', 'DAY', 'WARM', 'HEAT', 'LIGHT', 'SHINE', 'BRIGHT', 'GLOW',
  'SUNBEAM', 'SUNRISE', 'SUNSET', 'RADIANT', 'WARMTH', 'GOLDEN', 'ZEPHYR', 'BREEZE', 'HORIZON', 'TWILIGHT',
  'DAWN', 'DUSK', 'CLEAR', 'CLOUD', 'SOLAR', 'BEAM', 'SHADOW', 'LUMEN', 'AMBER', 'GLINT',
  'SPARKLE', 'VAPOR', 'FLURRY', 'DRIFT', 'WIND', 'GALE', 'MIST', 'FROST', 'RAIN', 'CALM',
  'SUMMER', 'SPRING', 'AUTUMN', 'WINTER', 'SHOWER', 'RAINBOW', 'SEASON', 'CLIMATE', 'STORM', 'THUNDER',
  'LIGHTNING', 'WEATHER', 'WARMTH', 'GLIMMER', 'SHIMMER', 'FLARE', 'CORONA', 'AURA', 'HALO', 'ZENITH',

  // Landscape & Exploration
  'VALLEY', 'CANYON', 'SUMMIT', 'PEAK', 'RIDGE', 'CLIFF', 'CAVERN', 'PLATEAU', 'HIGHLAND', 'TRAIL',
  'FOOTHILL', 'BOULDER', 'RIVER', 'BROOK', 'CREEK', 'SPRING', 'CASCADE', 'STREAM', 'GORGE', 'OASIS',
  'PATH', 'ROAD', 'HIKE', 'TREK', 'WALK', 'ROAM', 'SEEK', 'DISCOVER', 'JOURNEY', 'VOYAGE',
  'TERRAIN', 'LAND', 'GROUND', 'HILL', 'MOUND', 'SLOPE', 'BLUFF', 'RAVINE', 'CHASM', 'ABYSS',
  'PASS', 'GAP', 'CREST', 'PINNACLE', 'TOP', 'HEIGHT', 'ASCENT', 'VISTA', 'LOOKOUT', 'PANORAMA',

  // Wisdom, Spirit & Mind
  'MIND', 'LOGIC', 'THINK', 'SMART', 'BRAIN', 'IDEA', 'FOCUS', 'PUZZLE', 'GENIUS', 'CLEVER',
  'WISE', 'LEARN', 'STUDY', 'SOLVE', 'WISDOM', 'INSIGHT', 'TALENT', 'VISION', 'SCHOLAR', 'REASON',
  'CLARITY', 'PONDER', 'MASTER', 'ENIGMA', 'ENERGY', 'SPIRIT', 'VIBRANT', 'HARMONY', 'PEACE', 'SERENE',
  'SKILL', 'CRAFT', 'ARTIST', 'GENIUS', 'THEORY', 'CONCEPT', 'MEMORY', 'WITTY', 'AGILE', 'SHARP',
  'BRILLIANT', 'MEDITATE', 'REFLECT', 'CREATE', 'IMAGINE', 'DESIGN', 'INVENT', 'PURPOSE', 'DESTINY', 'BRAVE',

  // Gems & Wonders
  'RUBY', 'TOPAZ', 'EMERALD', 'OPAL', 'GARNET', 'QUARTZ', 'CRYSTAL', 'AGATE', 'JADE', 'DIAMOND',
  'SAPPHIRE', 'GOLD', 'SILVER', 'COPPER', 'BRONZE', 'PRISM', 'LUSTER', 'SHIELD', 'VALOR', 'CROWN',
  'MAGIC', 'FAIRY', 'DREAM', 'SPARK', 'FLAME', 'BLAZE', 'SPLENDOR', 'MIRACLE', 'WONDER', 'NATURE',
  'HONEY', 'FRUIT', 'MELON', 'PEACH', 'LEMON', 'MANGO', 'APPLE', 'CHERRY', 'BERRY', 'PLUM',
  'APRICOT', 'ORANGE', 'BANANA', 'GRAPE', 'FIG', 'LIME', 'PAPAYA', 'GUAVA', 'KIWI', 'COCONUT',

  // Climax & Triumph (for high levels)
  'TRIUMPH', 'VICTORY', 'CHAMPION', 'PINNACLE', 'SUPREME', 'VALIANT', 'MAJESTY', 'LEGEND', 'HERO', 'BRAVERY',
  'COURAGE', 'EXPLORE', 'SPLENDID', 'GLORIOUS', 'PHOENIX', 'THOUGHT', 'BRILLIANT', 'HONOR', 'PRIDE', 'POWER',
  'EMPIRE', 'DYNASTY', 'ROYAL', 'SOVEREIGN', 'MONARCH', 'REGAL', 'NOBLE', 'KNIGHT', 'SENTRY', 'GUARDIAN'
];

// ==========================================
// 2. EXPANDED BUBBLE OCEAN VOCABULARY (350+ words)
// ==========================================
const OCEAN_WORDS = [
  'ATLANTIS', 'TRIDENT', 'PIRATE', 'SHELL', 'OCEAN', 'PEARL', 'SHARK', 'DOLPHIN', 'BEACON', 'ANCHOR',
  'HARBOR', 'TRENCH', 'CORAL', 'TURTLE', 'NAVY', 'TIDE', 'WAVE', 'REEF', 'FISH', 'SAND',
  'PALM', 'GOLD', 'SHIP', 'COVE', 'JUMP', 'SWIM', 'KING', 'GLOW', 'TAIL', 'SONG',
  'RUIN', 'CITY', 'DEEP', 'SEAWATER', 'MARINER', 'COMPASS', 'LAGOON', 'PACIFIC', 'ATLANTIC', 'ANEMONE',
  'BARRIER', 'OYSTER', 'FINS', 'CREST', 'ISLAND', 'MARINA', 'VOLCANO', 'BREAKER', 'SEAGULL', 'MERMAID',
  'TEMPLE', 'SPLASH', 'LIGHT', 'BEACH', 'SHORE', 'SQUID', 'SEAWEED', 'SONAR', 'CLOWN', 'SPONGE',
  'DIVING', 'GIANT', 'WHALE', 'NORTH', 'CAVE', 'BOARD', 'CROWN', 'DOCK', 'DIVE', 'MASK',
  'HOLE', 'SURF', 'RIDE', 'PEAK', 'TROPIC', 'ABYSS', 'ROYAL', 'MARITIME', 'NAUTICAL', 'MUTINY',
  'FLOAT', 'ISLET', 'CRAB', 'VALLEY', 'LOBSTER', 'SHRIMP', 'WALRUS', 'SEAL', 'OTTER', 'MANATEE',
  'ORCA', 'KRAKEN', 'NEPTUNE', 'POSEIDON', 'SIREN', 'NAUTILUS', 'PELICAN', 'STARFISH', 'JELLY', 'STINGRAY',
  'SEAHORSE', 'BARRACUDA', 'ANGLER', 'PLANKTON', 'KELP', 'ALGAE', 'ATOLL', 'STRAIT', 'FJORD', 'GULF',
  'BAYOU', 'SOUND', 'CURRENT', 'SURGE', 'TSUNAMI', 'VORTEX', 'EDDY', 'BILLOW', 'SPRAY', 'DRIFT',
  'FOAM', 'FROTH', 'MAELSTROM', 'VOYAGE', 'CRUISE', 'GALLEON', 'FRIGATE', 'CLIPPER', 'VESSEL', 'RAFT',
  'CANOE', 'KAYAK', 'MAST', 'RUDDER', 'HELM', 'KEEL', 'HULL', 'CABIN', 'DECK', 'PORTHOLE',
  'SEXTANT', 'RADAR', 'BUOY', 'LIGHTHOUSE', 'JETTY', 'PIER', 'QUAY', 'WHARF', 'SALTY', 'BRINE',
  'AQUATIC', 'SUBMARINE', 'SCUBA', 'SNORKEL', 'WETSUIT', 'GOGGLES', 'HARPOON', 'TREASURE', 'CHEST', 'DOUBLOON',
  'SHIPWRECK', 'RELIC', 'ARTIFACT', 'SUNKEN', 'AQUAMARINE', 'AZURE', 'COBALT', 'TURQUOISE', 'CERULEAN', 'INDIGO',
  'CYAN', 'PELAGIC', 'BENTHIC', 'HYDRO', 'SHALLOWER', 'ESTUARY', 'MANGROVE', 'TIDAL', 'GILL', 'SCALES',
  'TENTACLE', 'BEAK', 'CARAPACE', 'BLUBBER', 'BALEEN', 'SPOUT', 'FLUKES', 'SHOAL', 'SCHOOL', 'MARIN',
  'CORALITE', 'MEDUSA', 'BARNACLE', 'LIMPET', 'CONCH', 'PERIWINKLE', 'CUTTLEFISH', 'OCTOPUS', 'VIPERFISH',
  'NAVI', 'SAIL', 'WINDWARD', 'LEEWARD', 'ANCHORAGE', 'COAST', 'COASTLINE', 'ESTUARY', 'LAGOON', 'REEFS',
  'ISLANDER', 'TROPICAL', 'EQUATOR', 'NAVIGATION', 'CHART', 'LOGBOOK', 'BEARING', 'KNOT', 'FATHOM', 'LEAGUE',
  'CORSAIR', 'BUCCANEER', 'CUTLASS', 'CANNON', 'RIGGING', 'CAPSTAN', 'BILGE', 'BALLAST', 'HATCHWAY', 'GALLEY',
  'ANCHORED', 'MOORING', 'SEABED', 'OCEANIC', 'SUBMERGED', 'DEEPSEA', 'HYDROFOIL', 'SPEEDBOAT', 'CATAMARAN', 'TRIMARAN',
  'DINGHY', 'GONDOLA', 'SCHOONER', 'SLOOP', 'BRIG', 'CORVETTE', 'DESTROYER', 'CRUISER', 'CARAVEL', 'FLAGSHIP'
];

// Deduplicate and filter length 3 to 7
const CLEAN_SUNNY_WORDS = [...new Set(SUNNY_WORDS)].filter(w => w.length >= 3 && w.length <= 7);
const CLEAN_OCEAN_WORDS = [...new Set(OCEAN_WORDS)].filter(w => w.length >= 3 && w.length <= 7);

console.log(`Curated Sunny Valley word pool: ${CLEAN_SUNNY_WORDS.length} unique words.`);
console.log(`Curated Bubble Ocean word pool: ${CLEAN_OCEAN_WORDS.length} unique words.`);

// MASKS
const MASKS = {
  square: [
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '#']
  ],
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
  ]
};

// Ocean masks info
const OCEAN_MASKS_INFO = [
  { name: 'Clam Shell', icon: '🐚', mask: MASKS.octagon },
  { name: 'Anchor', icon: '⚓', mask: MASKS.cross },
  { name: 'Water Drop', icon: '🫧', mask: MASKS.diamond },
  { name: 'Ocean Fish', icon: '🐟', mask: MASKS.square },
  { name: 'Neptune Trident', icon: '🔱', mask: MASKS.cross },
  { name: 'Jellyfish', icon: '🪼', mask: MASKS.octagon },
  { name: 'Nautilus Spiral', icon: '🐚', mask: MASKS.diamond },
  { name: 'Atlantis Citadel', icon: '🏰', mask: MASKS.square }
];

// Directions
const DIRS_EASY = [[1, 0], [0, 1]];
const DIRS_MEDIUM = [[1, 0], [0, 1], [1, 1], [1, -1]];
const DIRS_ALL_8 = [
  [1, 0], [0, 1], [1, 1], [1, -1],
  [-1, 0], [0, -1], [-1, -1], [-1, 1]
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateLevelGrid(candidateWords, allowedDirs, mask) {
  const SIZE = 8;
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let bestGrid = null;
  let bestTargetWords = [];

  for (let attempt = 0; attempt < 30; attempt++) {
    const grid = Array(SIZE).fill(null).map((_, r) =>
      Array(SIZE).fill(null).map((_, c) => (mask[r][c] === '#' ? ' ' : '-'))
    );
    const placedWords = [];

    // Sort words by length descending for easier placement
    const sortedWords = [...candidateWords].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      let placed = false;
      let tries = 0;

      while (!placed && tries < 200) {
        tries++;
        const dir = allowedDirs[Math.floor(Math.random() * allowedDirs.length)];
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

    if (placedWords.length > bestTargetWords.length) {
      bestTargetWords = placedWords;
      bestGrid = grid.map(row =>
        row.map(char => {
          if (char === '-') return ' ';
          if (char === ' ') return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
          return char;
        })
      );
    }

    if (bestTargetWords.length === candidateWords.length) break;
  }

  // Verification
  const verifiedWords = bestTargetWords.filter(tw => {
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

  return { grid: bestGrid, targetWords: verifiedWords };
}

// Exact Hardness Calculator based on the [4-Climb + 1-Relief Drop] Level Design Graph
function getLevelHardness(level) {
  if (level <= 0) return 1.0;
  const cycle0 = [1.0, 3.5, 5.5, 7.5, 5.7];
  if (level <= 5) return cycle0[level - 1];
  const cycle1 = [8.5, 9.5, 10.7, 12.2, 11.0];
  if (level <= 10) return cycle1[level - 6];

  const cycleIndex = Math.floor((level - 1) / 5);
  const stepIndex = (level - 1) % 5;
  const cycleGrowth = 4.7;

  const baseValue = cycle1[stepIndex];
  const hardness = baseValue + (cycleIndex - 1) * cycleGrowth;
  return Math.round(hardness * 10) / 10;
}

// ==========================================
// 3. GENERATE SUNNY VALLEY LEVELS 1 - 50
// ==========================================
console.log('\n--- GENERATING SUNNY VALLEY (LEVELS 1 - 50) ---');
const sunnyLevels = [];
const sunnyWordUsage = {}; // word -> last level seen

let sunnyAvailablePool = shuffle([...CLEAN_SUNNY_WORDS]);

for (let lvl = 1; lvl <= 50; lvl++) {
  const hardness = getLevelHardness(lvl);
  const step = ((lvl - 1) % 5) + 1;
  const cycle = Math.floor((lvl - 1) / 5) + 1;
  const isPeak = step === 4;
  const isRelief = step === 5;

  let wordCount;
  let allowedDirs;
  let maskName;
  let difficultyName;

  if (hardness < 4.0) {
    wordCount = 4;
    allowedDirs = DIRS_EASY;
    maskName = 'square';
    difficultyName = `EASY (H: ${hardness})`;
  } else if (hardness < 7.0) {
    wordCount = isRelief ? 4 : 5;
    allowedDirs = isRelief ? DIRS_EASY : DIRS_MEDIUM;
    maskName = isRelief ? 'square' : 'octagon';
    difficultyName = isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `MEDIUM (H: ${hardness})`;
  } else if (hardness < 10.0) {
    wordCount = isRelief ? 5 : (isPeak ? 6 : 5);
    allowedDirs = isRelief ? DIRS_MEDIUM : DIRS_ALL_8;
    maskName = isRelief ? 'square' : (isPeak ? 'diamond' : 'octagon');
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `HARD (H: ${hardness})`);
  } else if (hardness < 13.0) {
    wordCount = isRelief ? 5 : (isPeak ? 7 : 6);
    allowedDirs = isRelief ? DIRS_MEDIUM : DIRS_ALL_8;
    maskName = isRelief ? 'square' : (isPeak ? 'cross' : 'diamond');
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `HARDER (H: ${hardness})`);
  } else {
    wordCount = isRelief ? 6 : (isPeak ? 8 : 7);
    allowedDirs = DIRS_ALL_8;
    maskName = isRelief ? 'square' : 'cross';
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `HARDEST (H: ${hardness})`);
  }

  if (lvl === 50) {
    wordCount = 8;
    allowedDirs = DIRS_ALL_8;
    maskName = 'cross';
    difficultyName = `VALLEY SUMMIT CLIMAX 👑 (H: ${hardness})`;
  }

  const mask = MASKS[maskName];

  // Pick unique words for this level with cooldown of at least 20 levels
  let chosenWords = [];
  let tries = 0;

  while (chosenWords.length < wordCount && tries < 600) {
    tries++;
    if (sunnyAvailablePool.length === 0) {
      const eligible = CLEAN_SUNNY_WORDS.filter(w => {
        const last = sunnyWordUsage[w];
        return last === undefined || (lvl - last) >= 20;
      });
      sunnyAvailablePool = shuffle(eligible);
    }
    const candidate = sunnyAvailablePool.pop();
    if (!candidate || chosenWords.includes(candidate)) continue;

    const last = sunnyWordUsage[candidate];
    if (last === undefined || (lvl - last) >= 20) {
      chosenWords.push(candidate);
    }
  }

  // Generate grid with these chosen words
  let gen = generateLevelGrid(chosenWords, allowedDirs, mask);
  let attempts = 0;
  while (gen.targetWords.length < Math.min(chosenWords.length, wordCount - 1) && attempts < 10) {
    attempts++;
    gen = generateLevelGrid(chosenWords, allowedDirs, mask);
  }

  // Mark words as used
  gen.targetWords.forEach(tw => {
    sunnyWordUsage[tw.word] = lvl;
  });

  // Calculate dynamic timer with relief breather bonus
  let baseSeconds = 22 - Math.min(8, hardness * 0.45);
  if (isRelief) baseSeconds += 3.5;
  if (isPeak) baseSeconds -= 1.5;
  const timeLimit = Math.max(50, Math.min(130, Math.round(gen.targetWords.length * baseSeconds)));

  sunnyLevels.push({
    id: lvl,
    title: `Level ${lvl}`,
    subtitle: `SUNNY VALLEY - ${difficultyName}`,
    world: 'island',
    themeIcon: lvl === 50 ? 'emoji_events' : (isPeak ? 'whatshot' : (isRelief ? 'eco' : 'wb_sunny')),
    maskName: maskName.charAt(0).toUpperCase() + maskName.slice(1),
    maskIcon: isPeak ? '🔥' : (isRelief ? '🌿' : '☀️'),
    stars: 0,
    completed: false,
    locked: false,
    timeLimit,
    grid: gen.grid,
    targetWords: gen.targetWords
  });
}

console.log(`Generated ${sunnyLevels.length} Sunny Valley levels.`);

// Check Sunny Valley word repetition distances
let sunnyCloseRepeats = 0;
const sunnyTracker = {};
sunnyLevels.forEach(l => {
  l.targetWords.forEach(tw => {
    sunnyTracker[tw.word] = (sunnyTracker[tw.word] || []).concat(l.id);
  });
});

for (const [w, lvls] of Object.entries(sunnyTracker)) {
  for (let i = 0; i < lvls.length - 1; i++) {
    const diff = lvls[i+1] - lvls[i];
    if (diff < 10) {
      sunnyCloseRepeats++;
      console.log(`WARNING: Sunny word ${w} repeated too close: ${lvls[i]} and ${lvls[i+1]}`);
    }
  }
}
console.log(`Sunny Valley close repeats (<10 levels): ${sunnyCloseRepeats}`);

// ==========================================
// 4. GENERATE BUBBLE OCEAN LEVELS 51 - 150
// ==========================================
console.log('\n--- GENERATING BUBBLE OCEAN (LEVELS 51 - 150) ---');
const oceanLevels = [];
const oceanWordUsage = {}; // word -> last level seen
let oceanAvailablePool = shuffle([...CLEAN_OCEAN_WORDS]);

for (let lvl = 51; lvl <= 150; lvl++) {
  const oceanIndex = lvl - 51; // 0 to 99
  const hardness = getLevelHardness(lvl);
  const step = ((lvl - 1) % 5) + 1;
  const cycle = Math.floor((lvl - 1) / 5) + 1;
  const isPeak = step === 4;
  const isRelief = step === 5;

  let wordCount;
  let allowedDirs;
  let difficultyName;

  if (hardness < 13.0) {
    wordCount = isRelief ? 5 : (isPeak ? 7 : 6);
    allowedDirs = isRelief ? DIRS_MEDIUM : DIRS_ALL_8;
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `DEEP CLIMB (H: ${hardness})`);
  } else if (hardness < 17.0) {
    wordCount = isRelief ? 6 : (isPeak ? 8 : 7);
    allowedDirs = isRelief ? DIRS_MEDIUM : DIRS_ALL_8;
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `ABYSS CLIMB (H: ${hardness})`);
  } else {
    wordCount = isRelief ? 7 : (isPeak ? 8 : 8);
    allowedDirs = DIRS_ALL_8;
    difficultyName = isPeak
      ? `CYCLE ${cycle} PEAK 🔥 (H: ${hardness})`
      : (isRelief ? `RELIEF BREATHER 🌿 (H: ${hardness})` : `OCEAN TRENCH (H: ${hardness})`);
  }

  if (lvl === 150) {
    wordCount = 8;
    allowedDirs = DIRS_ALL_8;
    difficultyName = `ATLANTIS SUMMIT ULTIMATE CLIMAX 👑 (H: ${hardness})`;
  }

  // Mask assignment: Relief gets open shell, Peak gets Trident/Cross
  let maskInfo;
  if (isRelief) {
    maskInfo = OCEAN_MASKS_INFO[0]; // Clam shell
  } else if (isPeak) {
    maskInfo = OCEAN_MASKS_INFO[4]; // Neptune Trident
  } else {
    maskInfo = OCEAN_MASKS_INFO[oceanIndex % OCEAN_MASKS_INFO.length];
  }

  const mask = maskInfo.mask;

  // Pick unique words for this level with cooldown of at least 15 levels
  let chosenWords = [];
  let tries = 0;
  while (chosenWords.length < wordCount && tries < 600) {
    tries++;
    if (oceanAvailablePool.length === 0) {
      const eligible = CLEAN_OCEAN_WORDS.filter(w => {
        const last = oceanWordUsage[w];
        return last === undefined || (lvl - last) >= 15;
      });
      oceanAvailablePool = shuffle(eligible);
    }
    const candidate = oceanAvailablePool.pop();
    if (!candidate || chosenWords.includes(candidate)) continue;

    const last = oceanWordUsage[candidate];
    if (last === undefined || (lvl - last) >= 15) {
      chosenWords.push(candidate);
    }
  }

  let gen = generateLevelGrid(chosenWords, allowedDirs, mask);
  let attempts = 0;
  while (gen.targetWords.length < Math.min(chosenWords.length, wordCount - 1) && attempts < 10) {
    attempts++;
    gen = generateLevelGrid(chosenWords, allowedDirs, mask);
  }

  gen.targetWords.forEach(tw => {
    oceanWordUsage[tw.word] = lvl;
  });

  let baseSeconds = 22 - Math.min(8, hardness * 0.45);
  if (isRelief) baseSeconds += 3.5;
  if (isPeak) baseSeconds -= 1.5;
  const timeLimit = Math.max(50, Math.min(130, Math.round(gen.targetWords.length * baseSeconds)));

  oceanLevels.push({
    id: lvl,
    title: `Level ${lvl}`,
    subtitle: `BUBBLE OCEAN - ${difficultyName}`,
    world: 'island',
    themeIcon: lvl === 150 ? 'emoji_events' : (isPeak ? 'whatshot' : (isRelief ? 'eco' : 'water_drop')),
    maskName: maskInfo.name,
    maskIcon: isPeak ? '🔥' : (isRelief ? '🌿' : maskInfo.icon),
    stars: 0,
    completed: false,
    locked: false,
    timeLimit,
    grid: gen.grid,
    targetWords: gen.targetWords
  });
}

console.log(`Generated ${oceanLevels.length} Bubble Ocean levels.`);

// Check Ocean word repetition distances
let oceanCloseRepeats = 0;
const oceanTracker = {};
oceanLevels.forEach(l => {
  l.targetWords.forEach(tw => {
    oceanTracker[tw.word] = (oceanTracker[tw.word] || []).concat(l.id);
  });
});

for (const [w, lvls] of Object.entries(oceanTracker)) {
  for (let i = 0; i < lvls.length - 1; i++) {
    const diff = lvls[i+1] - lvls[i];
    if (diff < 10) {
      oceanCloseRepeats++;
      console.log(`WARNING: Ocean word ${w} repeated too close: ${lvls[i]} and ${lvls[i+1]}`);
    }
  }
}
console.log(`Bubble Ocean close repeats (<10 levels): ${oceanCloseRepeats}`);

// ==========================================
// 5. WRITE OUT FILES
// ==========================================
const sunnyContent = `import { LevelData } from '../types';

export const GENERATED_LEVELS: LevelData[] = ${JSON.stringify(sunnyLevels, null, 2)};
`;

fs.writeFileSync('./src/data/generatedLevels.ts', sunnyContent, 'utf8');
console.log('Successfully wrote src/data/generatedLevels.ts (50 levels).');

const oceanContent = `import { LevelData } from '../types';

export const OCEAN_MASKS_INFO = ${JSON.stringify(OCEAN_MASKS_INFO.map(m => ({ name: m.name, icon: m.icon })), null, 2)};

export const OCEAN_LEVELS: LevelData[] = ${JSON.stringify(oceanLevels, null, 2)};
`;

fs.writeFileSync('./src/data/oceanLevels.ts', oceanContent, 'utf8');
console.log('Successfully wrote src/data/oceanLevels.ts (100 levels, 51-150).');
