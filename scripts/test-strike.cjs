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
const parse = (file) => ts.createSourceFile(file, read(file), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const gameAst = parse('src/native/views/GameView.tsx');
const appAst = parse('App.tsx');
const constants = { exports: {} };
vm.runInNewContext(compile(read('src/config/strike.ts')), constants);
const economy = { exports: {} };
vm.runInNewContext(compile(read('src/config/economy.ts')), economy);

function declaration(ast, name) {
  let found;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && (
      node.name.getText(ast) === name ||
      (ts.isArrayBindingPattern(node.name) && node.name.elements.some((item) => item.name?.getText(ast) === name))
    )) found = node;
    ts.forEachChild(node, visit);
  };
  visit(ast);
  assert.ok(found, `Missing actual source declaration: ${name}`);
  return found;
}

// Run the actual component body, replacing only its JSX result with observable
// handlers/state. All game hooks, effects, reset paths and callbacks stay real.
const gameInitializer = declaration(gameAst, 'NativeGameView').initializer;
const gameReturn = gameInitializer.body.statements.find((node) => ts.isReturnStatement(node));
assert.ok(gameReturn);
const gameCode = gameAst.text.slice(gameInitializer.getStart(gameAst), gameReturn.getStart(gameAst)) + `
  return {
    checkSelection, handleHint, handleReveal, handlePause, handleResume, handleExit,
    handleRetry, handleCompleteAttempt, resetLevelState,
    grid, targetWords, solvedCells, selectedCells, timeLeft, isPaused,
    isVictory, isGameOver, strikeLost, wordStreak, maxWordStreak, hasUsedCoinHint,
    attemptStatusRef, completionClaimedRef, victoryTimeoutRef,
  };
}`;

const playerDeclarations = [
  'playerState', 'playerStateRef', 'isRestoringStrike', 'restoreStrikeInFlight',
  'activeLevelId', 'currentScreen', 'showCenturyModal',
  'handleFailLevel', 'handleRestoreStrike', 'handleCompleteLevel',
];
let syncPlayerEffect;
const findSync = (node) => {
  if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression)
    && node.expression.expression.getText(appAst) === 'useEffect'
    && node.expression.arguments[0].getText(appAst).includes('playerStateRef.current = playerState')) {
    syncPlayerEffect = node.getText(appAst);
  }
  ts.forEachChild(node, findSync);
};
findSync(appAst);
assert.ok(syncPlayerEffect, 'Run the actual App player-state ref synchronization');
const appCode = `({ hasLoadedPlayer = true } = {}) => {
  ${playerDeclarations.map((name) => `const ${declaration(appAst, name).getText(appAst)};`).join('\n')}
  ${syncPlayerEffect}
  return { playerState, setPlayerState, handleFailLevel, handleRestoreStrike,
    handleCompleteLevel, isRestoringStrike, currentScreen, activeLevelId };
}`;

function clock() {
  let now = 0, nextId = 0;
  const pending = new Map();
  const schedule = (callback, delay, repeat) => {
    const id = ++nextId;
    pending.set(id, { callback, at: now + delay, repeat });
    return id;
  };
  return {
    setTimeout: (cb, ms) => schedule(cb, ms, 0),
    clearTimeout: (id) => pending.delete(id),
    setInterval: (cb, ms) => schedule(cb, ms, ms),
    clearInterval: (id) => pending.delete(id),
    has: (id) => pending.has(id),
    advance(ms, afterCallback = () => {}) {
      const end = now + ms;
      for (;;) {
        const next = [...pending].filter(([, timer]) => timer.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (!next) break;
        const [id, timer] = next;
        now = timer.at;
        if (timer.repeat) timer.at += timer.repeat;
        else pending.delete(id);
        timer.callback();
        afterCallback();
      }
      now = end;
    },
  };
}

// State updates queue until commit, like React. Functional updates are replayed
// against the same previous value to expose side effects inside an updater.
// In particular, App's setter is its real useState setter; it does NOT update
// playerStateRef synchronously as the older reward harness does.
function hookRunner(source, environment) {
  const slots = [];
  let cursor = 0, dirty = true, mounted = true, effects = [], value, props;
  const sameDeps = (a, b) => a && b && a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
  const context = {
    exports: {}, ...environment,
    useState(initial) {
      const index = cursor++;
      if (!slots[index]) {
        const slot = { value: typeof initial === 'function' ? initial() : initial, queued: [] };
        slot.set = (update) => { if (mounted) { slot.queued.push(update); dirty = true; } };
        slots[index] = slot;
      }
      return [slots[index].value, slots[index].set];
    },
    useRef(initial) {
      const index = cursor++;
      if (!slots[index]) slots[index] = { ref: { current: initial } };
      return slots[index].ref;
    },
    useCallback(callback, deps) {
      const index = cursor++;
      if (!slots[index] || !sameDeps(slots[index].deps, deps)) slots[index] = { callback, deps };
      return slots[index].callback;
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const slot = slots[index] ||= {};
      if (!sameDeps(slot.deps, deps)) {
        slot.deps = deps;
        effects.push(() => { slot.cleanup?.(); slot.cleanup = callback(); });
      }
    },
  };
  vm.runInNewContext(compile(`exports.render = ${source};`), context);
  return {
    render(nextProps = props) { props = nextProps; dirty = true; this.flush(); },
    flush() {
      let commits = 0;
      while (dirty && mounted) {
        assert.ok(++commits < 30, 'Effects must settle');
        dirty = false;
        for (const slot of slots) {
          if (!slot.queued) continue;
          for (const update of slot.queued.splice(0)) {
            if (typeof update === 'function') {
              const next = update(slot.value);
              update(slot.value);
              slot.value = next;
            } else slot.value = update;
          }
        }
        cursor = 0;
        value = context.exports.render(props);
        const pendingEffects = effects;
        effects = [];
        for (const effect of pendingEffects) effect();
      }
    },
    unmount() { mounted = false; for (const slot of slots) slot.cleanup?.(); },
    get value() { return value; },
  };
}

function harness({ strike = 30, hearts = 5, wordCount = 1, timeLimit = 1 } = {}) {
  const timers = clock();
  const audio = [];
  const ads = [];
  const alerts = [];
  let failures = 0, completions = 0, exits = 0, deductions = 0, hintUses = 0;
  const words = ['AB', 'CD'].slice(0, wordCount);
  const level = {
    id: 1, timeLimit, grid: [['A', 'B', 'C', 'D']],
    targetWords: words.map((word, i) => ({ word, found: false, rowStart: 0, rowEnd: 0, colStart: i * 2, colEnd: i * 2 + 1 })),
  };
  const animation = () => ({ start() {}, stop() {} });
  const env = {
    ...timers, ...constants.exports, ...economy.exports, START_DEV_COINS: 500, DEFAULT_START_LEVEL: 1,
    console, INITIAL_LEVELS: [level],
    nativeAudio: new Proxy({}, { get: (_, method) => () => audio.push(method) }),
    Animated: {
      Value: class { setValue() {} interpolate() { return 0; } },
      spring: animation, sequence: animation, parallel: animation, timing: animation, loop: animation,
    },
    PanResponder: { create: (handlers) => ({ panHandlers: handlers }) },
    useWindowDimensions: () => ({ width: 390, height: 844 }),
    showRewardedAd: (...callbacks) => ads.push(callbacks),
    showSmartInterstitialAd() {}, Alert: { alert: (...args) => alerts.push(args) },
  };
  const app = hookRunner(appCode, env);
  app.render({});
  app.value.setPlayerState({ ...app.value.playerState, strike, hearts });
  app.flush();
  const game = hookRunner(gameCode, env);
  const props = () => ({
    levelId: 1, strike: app.value.playerState.strike, coins: app.value.playerState.coins,
    isRestoringStrike: app.value.isRestoringStrike,
    onFailLevel: () => { failures++; app.value.handleFailLevel(); },
    onCompleteLevel: (...args) => { completions++; app.value.handleCompleteLevel(...args); },
    onRestoreStrike: (...args) => app.value.handleRestoreStrike(...args),
    onExit: () => { exits++; }, onUseHint: () => { hintUses++; return true; },
    onDeductCoins: (amount) => {
      deductions++;
      app.value.setPlayerState((prev) => ({ ...prev, coins: prev.coins - amount }));
      return true;
    },
  });
  const flush = () => { app.flush(); game.render(props()); };
  game.render(props());
  return {
    timers, level, audio, ads, alerts, flush,
    advance: (ms) => timers.advance(ms, flush),
    rawAdvance: (ms) => timers.advance(ms),
    unmount: () => game.unmount(),
    get game() { return game.value; }, get app() { return app.value; },
    get state() { return app.value.playerState; },
    get counts() { return { failures, completions, exits, deductions, hintUses }; },
  };
}

const firstWord = [{ r: 0, c: 0 }, { r: 0, c: 1 }];
const secondWord = [{ r: 0, c: 2 }, { r: 0, c: 3 }];

test('only one coin-funded hint is allowed during a level attempt', () => {
  const h = harness({ wordCount: 2 });
  h.game.handleHint();
  h.flush();
  assert.equal(h.game.hasUsedCoinHint, true);
  assert.equal(h.counts.hintUses, 1);
  h.game.handleHint();
  h.flush();
  assert.equal(h.counts.hintUses, 1);
  assert.equal(h.alerts.length, 0);
});

for (const action of ['word', 'reveal']) {
  test(`${action}: solving just before timeout protects victory during its 450ms delay`, () => {
    const h = harness();
    h.advance(900);
    if (action === 'word') assert.equal(h.game.checkSelection(firstWord), true);
    else h.game.handleReveal();
    assert.equal(h.game.attemptStatusRef.current, 'won');
    // The interval fires before React commits the victory state.
    h.rawAdvance(100);
    h.flush();
    assert.equal(h.counts.failures, 0);
    assert.equal(h.game.timeLeft, 1);
    assert.equal(h.game.isVictory, false);
    h.advance(350);
    assert.equal(h.game.isVictory, true);
    assert.equal(h.game.isGameOver, false);
    h.game.handleCompleteAttempt();
    h.game.handleCompleteAttempt();
    h.flush();
    assert.equal(h.counts.completions, 1);
    assert.equal(h.state.strike, 40);
    assert.equal(h.state.hearts, 5);
    assert.equal(h.state.solvedCount, 24);
    assert.equal(h.counts.deductions, action === 'reveal' ? 1 : 0);
  });
}

test('timeout deducts once, displays actual loss, and never makes strike or hearts negative', () => {
  for (const [strike, hearts, expectedStrike, expectedHearts] of [[35, 2, 25, 1], [5, 1, 0, 0], [0, 0, 0, 0]]) {
    const h = harness({ strike, hearts });
    h.rawAdvance(5000);
    h.flush();
    assert.equal(h.counts.failures, 1);
    assert.equal(h.state.strike, expectedStrike);
    assert.equal(h.state.hearts, expectedHearts);
    assert.equal(h.game.strikeLost, Math.min(strike, 10));
    assert.equal(h.game.timeLeft, 0);
    assert.equal(h.game.isGameOver, true);
    assert.equal(h.game.checkSelection(firstWord), false);
    h.game.handleReveal();
    h.game.handleCompleteAttempt();
    h.advance(5000);
    assert.equal(h.counts.failures, 1);
    assert.equal(h.counts.completions, 0);
    assert.equal(h.counts.deductions, 0);
  }
});

test('Pause and Resume preserve solved words, remaining time and strike', () => {
  const h = harness({ wordCount: 2, timeLimit: 5 });
  h.game.checkSelection(firstWord);
  h.flush();
  h.advance(1000);
  assert.equal(h.game.timeLeft, 4);
  h.game.handlePause();
  h.rawAdvance(1000); // pause ref must protect the tick before render
  h.flush();
  h.advance(10000);
  assert.equal(h.game.timeLeft, 4);
  assert.equal(h.game.targetWords[0].found, true);
  assert.equal(h.game.targetWords[1].found, false);
  assert.equal(h.game.checkSelection(secondWord), false);
  h.game.handleReveal();
  assert.equal(h.counts.deductions, 0);
  h.game.handleResume();
  h.flush();
  h.advance(1000);
  assert.equal(h.game.timeLeft, 3);
  assert.equal(h.game.targetWords[0].found, true);
  assert.equal(h.state.strike, 30);
  assert.equal(h.counts.failures, 0);
});

test('retry clears word streak and loss state, and a fresh attempt can fail or win', () => {
  const h = harness({ strike: 40, wordCount: 2 });
  h.game.checkSelection(firstWord);
  h.flush();
  assert.equal(h.game.wordStreak, 1);
  assert.equal(h.game.maxWordStreak, 1);
  h.advance(1000);
  assert.equal(h.counts.failures, 1);
  h.game.handleRetry();
  h.flush();
  assert.equal(h.game.attemptStatusRef.current, 'playing');
  assert.equal(h.game.wordStreak, 0);
  assert.equal(h.game.maxWordStreak, 0);
  assert.equal(h.game.strikeLost, 0);
  assert.equal(h.game.isGameOver, false);
  assert.ok(h.game.targetWords.every((word) => !word.found));
  h.advance(1000);
  assert.equal(h.counts.failures, 2);
  h.game.handleRetry();
  h.flush();
  h.game.checkSelection(firstWord);
  h.flush();
  h.game.checkSelection(secondWord);
  h.advance(450);
  h.game.handleCompleteAttempt();
  h.game.handleCompleteAttempt();
  h.flush();
  assert.equal(h.counts.completions, 1);
  assert.equal(h.state.strike, 30);
});

test('reset cancels delayed victory and clears the completion lock for a new attempt', () => {
  const h = harness();
  h.game.checkSelection(firstWord);
  const staleTimer = h.game.victoryTimeoutRef.current;
  assert.ok(h.timers.has(staleTimer));
  h.game.resetLevelState(h.level);
  h.flush();
  assert.equal(h.timers.has(staleTimer), false);
  h.advance(450);
  assert.equal(h.game.isVictory, false);
  h.game.checkSelection(firstWord);
  h.advance(450);
  h.game.handleCompleteAttempt();
  h.flush();
  assert.equal(h.counts.completions, 1);
  h.game.resetLevelState(h.level);
  h.flush();
  h.game.checkSelection(firstWord);
  h.advance(450);
  h.game.handleCompleteAttempt();
  h.flush();
  assert.equal(h.counts.completions, 2);
});

test('unmount cancels pending victory and exit prevents a later timer penalty', () => {
  const won = harness();
  won.game.checkSelection(firstWord);
  const staleTimer = won.game.victoryTimeoutRef.current;
  won.unmount();
  assert.equal(won.timers.has(staleTimer), false);
  won.rawAdvance(5000);
  assert.equal(won.audio.includes('playVictory'), false);
  assert.equal(won.counts.failures, 0);
  const playing = harness();
  playing.game.handleExit();
  playing.rawAdvance(5000);
  playing.flush();
  assert.equal(playing.counts.exits, 1);
  assert.equal(playing.counts.failures, 0);
});

test('zero-strike retry waits for one rewarded restore; cancellation permits another ad', () => {
  const h = harness({ strike: 10 });
  h.advance(1000);
  assert.equal(h.state.strike, 0);
  h.game.handleRetry();
  h.game.handleRetry();
  assert.equal(h.ads.length, 1);
  h.flush();
  assert.equal(h.app.isRestoringStrike, true);
  h.ads[0][2](); // closed without earning a reward
  h.flush();
  assert.equal(h.state.strike, 0);
  assert.equal(h.game.attemptStatusRef.current, 'lost');
  assert.equal(h.app.isRestoringStrike, false);
  h.game.handleRetry();
  assert.equal(h.ads.length, 2);
  h.ads[1][0]();
  h.ads[1][0](); // repeated SDK reward callback
  h.ads[1][2]();
  h.flush();
  assert.equal(h.state.strike, 10);
  assert.equal(h.app.isRestoringStrike, false);
  assert.equal(h.game.attemptStatusRef.current, 'playing');
  assert.equal(h.game.timeLeft, 1);
  assert.equal(h.game.isGameOver, false);
  h.advance(1000);
  assert.equal(h.counts.failures, 2);
});
