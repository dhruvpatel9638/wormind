const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const compile = (source) => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const flush = () => new Promise((resolve) => setImmediate(resolve));

async function audioHarness() {
  const players = [];
  const pendingSeeks = [];
  let holdSeeks = false;
  let now = 0, timerId = 0;
  const timers = new Map();
  const played = [];
  const context = {
    exports: {}, console, Date: { now: () => now },
    setTimeout: (callback, delay) => {
      timers.set(++timerId, { callback, at: now + delay });
      return timerId;
    },
    clearTimeout: (id) => timers.delete(id),
    require: (name) => name !== 'expo-audio' ? name : {
      setAudioModeAsync: async () => {},
      createAudioPlayer: (asset) => {
        const player = {
          asset, isLoaded: true, plays: 0, currentTime: 0, duration: 1, playing: false,
          addListener: (_, callback) => { player.onStatus = callback; },
          play() { this.plays++; this.playing = true; played.push({ asset, at: now }); },
          pause() { this.playing = false; },
          seekTo: () => new Promise((resolve) => {
            const done = () => { player.currentTime = 0; resolve(); };
            if (holdSeeks) pendingSeeks.push(done);
            else done();
          }),
          finish() {
            this.currentTime = 1;
            this.playing = false;
            this.onStatus({ didJustFinish: true });
          },
        };
        players.push(player);
        return player;
      },
    },
  };
  vm.runInNewContext(compile(read('src/native/audio.ts')), context);
  await flush();
  return {
    audio: context.exports.nativeAudio, players,
    played,
    advance: async (ms) => {
      const end = now + ms;
      while (true) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
        await flush();
      }
      now = end;
    },
    taps: players.filter((p) => p.asset.endsWith('letter_tap.wav')),
    hold: () => { holdSeeks = true; },
    resolve: async () => { pendingSeeks.splice(0).forEach((done) => done()); await flush(); },
  };
}

test('repeated letter sounds reuse prepared players and rewind completed clips', async () => {
  const h = await audioHarness();
  const initialCount = h.players.length;
  for (let i = 0; i < 120; i++) {
    h.audio.playLetterTap(i);
    const active = h.taps.find((p) => p.playing);
    assert.ok(active);
    assert.equal(active.currentTime, 0);
    active.finish();
    await flush();
  }
  assert.equal(h.taps.reduce((sum, p) => sum + p.plays, 0), 120);
  assert.equal(h.players.length, initialCount);
});

test('a delayed completion event must not pause a newly replayed letter', async () => {
  const h = await audioHarness();
  h.audio.playLetterTap();
  const player = h.taps[0];
  player.finish();
  await flush();
  h.audio.playLetterTap();
  assert.equal(player.playing, true);
  player.onStatus({ didJustFinish: true }); // queued event from the previous play
  await flush();
  assert.equal(player.playing, true, 'old completion must not stop the new sound');
});

test('a stale finish during native startup must not rewind a fresh sound', async () => {
  const h = await audioHarness();
  h.audio.playLetterTap();
  const player = h.taps[0];
  player.finish();
  await flush();
  h.audio.playLetterTap();
  // Native play() may not have reached a playing state yet, but its live
  // position is already at the beginning rather than at the old clip's end.
  player.playing = false;
  let pauses = 0;
  player.pause = () => { pauses++; };
  player.onStatus({ didJustFinish: true });
  await flush();
  assert.equal(pauses, 0);
});

test('word-found feedback does not steal a drag sound voice', async () => {
  const h = await audioHarness();
  for (let i = 0; i < h.taps.length; i++) h.audio.playLetterTap();
  h.audio.playWordFound();
  await flush();
  assert.ok(h.taps.every((p) => p.playing && p.plays === 1));
  assert.ok(h.players.some((p) => p.asset.endsWith('btn_1.wav') && p.playing));
});

test('drag clip has immediate onset instead of the original silent lead-in', () => {
  const clip = fs.readFileSync(path.join(__dirname, '../assets/sounds/letter_tap.wav'));
  const rate = clip.readUInt32LE(24);
  const frameSize = clip.readUInt16LE(32);
  let first = -1, strong = -1;
  for (let offset = 44; offset < clip.length; offset += 2) {
    const amplitude = Math.abs(clip.readInt16LE(offset));
    if (first === -1 && amplitude > 10) first = offset - 44;
    if (strong === -1 && amplitude > 300) strong = offset - 44;
  }
  assert.ok(first >= 0 && first / (rate * frameSize) < 0.005);
  assert.ok(strong >= 0 && strong / (rate * frameSize) < 0.030);
  assert.ok((clip.length - 44) / (rate * frameSize) < 0.180);
});

test('fast swipes overlap; exhausted voices replay only the latest pending request', async () => {
  const h = await audioHarness();
  h.hold();
  for (let i = 0; i < h.taps.length; i++) h.audio.playLetterTap();
  assert.ok(h.taps.every((p) => p.plays === 1));
  for (let i = 0; i < h.taps.length * 3; i++) h.audio.playLetterTap();
  assert.ok(h.taps.every((p) => p.plays === 1), 'must wait for rewind');
  await h.resolve();
  assert.ok(h.taps.every((p) => p.plays === 2), 'must not queue stale sounds');
});

test('mute cancels pending replays, even if unmuted before seek finishes', async () => {
  const h = await audioHarness();
  h.hold();
  for (let i = 0; i < h.taps.length + 1; i++) h.audio.playLetterTap();
  h.audio.setSoundEnabled(false);
  h.audio.playWordFound();
  h.audio.setSoundEnabled(true);
  await h.resolve();
  assert.ok(h.taps.every((p) => p.plays === 1 && !p.playing));
  h.audio.playLetterTap();
  assert.equal(h.taps.reduce((sum, p) => sum + p.plays, 0), h.taps.length + 1);
});

// Exercise the real gesture callbacks with state setters left unrendered. This
// models multiple touch events arriving before React commits a state update.
function gestureHarness(audio) {
  const source = read('src/native/views/GameView.tsx');
  const ast = ts.createSourceFile('GameView.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let handlers, updateSelection;
  const visit = (node) => {
    if (ts.isCallExpression(node) && node.expression.getText(ast) === 'PanResponder.create') {
      handlers = node.arguments[0].getText(ast);
    }
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'updateDragSelection') {
      updateSelection = node.initializer.getText(ast);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(handlers);
  assert.ok(updateSelection);
  const taps = [], checked = [];
  const state = {
    isPaused: false, isVictory: false, isGameOver: false,
    grid: Array.from({ length: 8 }, () => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']),
    checkSelection: (cells) => { checked.push(cells); return false; },
  };
  let selection = [], word = '', scrolling = true;
  const context = {
    exports: {}, TILE_SIZE: 10, gameStateRef: { current: state }, dragSelectionRef: { current: [] }, dragActiveRef: { current: false },
    nativeAudio: {
      playLetterTaps: (count) => { taps.push(count); audio?.playLetterTaps(count); },
      cancelLetterTaps: () => audio?.cancelLetterTaps(),
    },
    setSelectedCells: (cells) => { assert.notEqual(typeof cells, 'function'); selection = cells; },
    setSpelledWord: (value) => { word = value; },
    setIsScrollingEnabled: (value) => { scrolling = value; },
    triggerStreakReset: () => {},
  };
  vm.runInNewContext(compile(`const updateDragSelection = ${updateSelection}; exports.handlers = ${handlers};`), context);
  const event = (r, c) => ({ nativeEvent: { locationX: c * 10 + 5, locationY: r * 10 + 5 } });
  let lastRow = 0, lastCol = 0;
  return {
    state, taps, checked,
    grant: (r, c) => { lastRow = r; lastCol = c; context.exports.handlers.onPanResponderGrant(event(r, c)); },
    move: (r, c) => { lastRow = r; lastCol = c; context.exports.handlers.onPanResponderMove(event(r, c)); },
    release: (r = lastRow, c = lastCol) => context.exports.handlers.onPanResponderRelease(event(r, c)),
    terminate: () => context.exports.handlers.onPanResponderTerminate(),
    get selection() { return selection; }, get word() { return word; }, get scrolling() { return scrolling; },
  };
}

test('drag sounds follow changed cells, including equal-length direction changes and backtracking', () => {
  const h = gestureHarness();
  h.grant(0, 0);
  assert.equal(h.scrolling, false);
  h.move(0, 0); // repeated event in the same tile
  h.move(0, 2);
  h.move(2, 0); // same length, different direction
  h.move(0, 0); // backtrack to start
  assert.deepEqual(h.taps, [1, 2, 2, 2]);
  assert.equal(h.word, 'A');
  h.move(0, 3);
  h.move(1, 2); // invalid angle must not alter selection or sound
  h.release();
  assert.equal(h.checked.length, 1);
  assert.equal(h.checked[0].length, 4);
  assert.equal(h.selection.length, 0);
  assert.equal(h.scrolling, true);
});

test('entering from an empty cell plays the first letter; cancelled and paused drags stay clear', () => {
  const h = gestureHarness();
  h.state.grid[0][0] = ' ';
  h.grant(0, 0);
  h.move(0, 1);
  assert.deepEqual(h.taps, [1]);
  assert.equal(h.word, 'B');
  h.terminate();
  assert.equal(h.selection.length, 0);
  assert.equal(h.word, '');
  assert.equal(h.scrolling, true);
  h.state.isPaused = true;
  h.grant(0, 2);
  h.move(0, 3);
  h.release();
  assert.deepEqual(h.taps, [1]);
  assert.equal(h.checked.length, 0);
});

test('a coalesced eight-cell fast swipe produces eight separated clicks', async () => {
  const audio = await audioHarness();
  const h = gestureHarness(audio.audio);
  h.grant(0, 0);
  h.move(0, 7); // only one move event for seven crossed tiles
  assert.equal(h.selection.length, 8, 'selection must not wait for audio timers');
  h.release();
  assert.deepEqual(h.taps, [1, 7], 'release at the same endpoint must not duplicate ticks');
  await audio.advance(320);
  assert.deepEqual(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).map((p) => p.at),
    [0, 40, 80, 120, 160, 200, 240, 280]);
  assert.equal(h.checked[0].length, 8);
});

test('fast grant-to-release swipes recover the final position without any move events', async () => {
  for (const [r, c] of [[0, 7], [7, 0], [7, 7]]) {
    const audio = await audioHarness();
    const h = gestureHarness(audio.audio);
    h.grant(0, 0);
    h.release(r, c);
    assert.equal(h.checked[0].length, 8);
    assert.equal(h.checked[0][7].r, r);
    assert.equal(h.checked[0][7].c, c);
    await audio.advance(320);
    assert.equal(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).length, 8);
  }
});

test('several move events in one frame still have audible spacing', async () => {
  const audio = await audioHarness();
  const h = gestureHarness(audio.audio);
  h.grant(0, 0);
  for (let c = 1; c < 8; c++) h.move(0, c);
  h.release();
  await audio.advance(320);
  assert.deepEqual(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).map((p) => p.at),
    [0, 40, 80, 120, 160, 200, 240, 280]);
});

test('a new fast swipe clears old queued clicks while preserving minimum spacing', async () => {
  const audio = await audioHarness();
  const h = gestureHarness(audio.audio);
  h.grant(0, 0);
  h.move(0, 7);
  h.release();
  await audio.advance(10);
  h.grant(1, 0);
  h.release(1, 2);
  await audio.advance(310);
  assert.deepEqual(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).map((p) => p.at),
    [0, 40, 80, 120]);
});

test('mute, termination and leaving the game cancel queued clicks', async () => {
  for (const stop of ['mute', 'terminate', 'exit']) {
    const audio = await audioHarness();
    audio.audio.setMusicEnabled(false);
    audio.audio.setInGame(true);
    const h = gestureHarness(audio.audio);
    h.grant(0, 0);
    h.move(0, 7);
    if (stop === 'mute') audio.audio.setSoundEnabled(false);
    if (stop === 'terminate') {
      h.terminate();
      h.release(0, 7);
      assert.equal(h.checked.length, 0, 'terminated gestures must not restart on release');
    }
    if (stop === 'exit') audio.audio.setInGame(false);
    await audio.advance(400);
    assert.equal(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).length, 1, stop);
  }
});

test('slow swipes remain immediate and backtracking counts skipped cells', async () => {
  const audio = await audioHarness();
  const h = gestureHarness(audio.audio);
  h.grant(0, 0);
  await audio.advance(100);
  h.move(0, 1);
  assert.deepEqual(audio.played.filter((p) => p.asset.endsWith('letter_tap.wav')).map((p) => p.at), [0, 100]);
  h.move(0, 5);
  h.move(0, 1);
  assert.deepEqual(h.taps, [1, 1, 4, 4]);
});

test('cancelled swipes cannot replay an old click after a slow native seek', async () => {
  const audio = await audioHarness();
  audio.hold();
  const h = gestureHarness(audio.audio);
  h.grant(0, 0);
  h.move(0, 7);
  await audio.advance(240); // seventh click is waiting for a native rewind
  assert.equal(audio.taps.reduce((sum, p) => sum + p.plays, 0), 6);
  h.terminate();
  await audio.resolve();
  await audio.advance(200);
  assert.equal(audio.taps.reduce((sum, p) => sum + p.plays, 0), 6);
});
