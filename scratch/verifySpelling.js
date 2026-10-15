import { OCEAN_LEVELS } from '../src/data/oceanLevels.js';

let errorsCount = 0;
let totalWordsChecked = 0;

OCEAN_LEVELS.forEach((level) => {
  level.targetWords.forEach((tw) => {
    totalWordsChecked++;
    const dr = tw.rowEnd === tw.rowStart ? 0 : tw.rowEnd > tw.rowStart ? 1 : -1;
    const dc = tw.colEnd === tw.colStart ? 0 : tw.colEnd > tw.colStart ? 1 : -1;
    let spelled = '';
    for (let i = 0; i < tw.word.length; i++) {
      const r = tw.rowStart + i * dr;
      const c = tw.colStart + i * dc;
      spelled += level.grid[r] ? level.grid[r][c] || '' : '';
    }

    if (spelled !== tw.word) {
      errorsCount++;
      console.error(
        `MISMATCH at Level ${level.id}: Target="${tw.word}", Grid Spelled="${spelled}" at [${tw.rowStart},${tw.colStart}] -> [${tw.rowEnd},${tw.colEnd}]`
      );
    }
  });
});

if (errorsCount === 0) {
  console.log(`✅ VERIFICATION PASSED: Checked ${totalWordsChecked} words across ${OCEAN_LEVELS.length} levels with 0 spelling errors!`);
} else {
  console.error(`❌ VERIFICATION FAILED: Found ${errorsCount} errors!`);
}
