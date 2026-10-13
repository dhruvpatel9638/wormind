require('tsx/cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const strikeRules = require('../src/config/strike.ts');

// Exercise App's actual callbacks with queued state updates. The player ref
// changes only on commit, matching App's post-render synchronization effect.
const source = fs.readFileSync(path.join(__dirname, '../App.tsx'), 'utf8');
const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const handlers = new Map();
const visit = (node) => {
  if (ts.isVariableDeclaration(node) && node.initializer
    && ['handleFailLevel', 'handleRestoreStrike'].includes(node.name.getText(ast))) {
    handlers.set(node.name.getText(ast), node.initializer.getText(ast));
  }
  ts.forEachChild(node, visit);
};
visit(ast);
assert.equal(handlers.size, 2, 'App strike callbacks must be present');
const callbackCode = ts.transpileModule(
  [...handlers].map(([name, initializer]) => `exports.${name} = ${initializer};`).join('\n'),
  { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } },
).outputText;

function harness(strike = 0, loaded = true) {
  let state = { strike, hearts: 3, strikeZeroFails: 2, coins: 125 };
  let loading = false;
  const updates = [];
  const loadingUpdates = [];
  const requests = [];
  const alerts = [];
  const context = {
    exports: {},
    ...strikeRules,
    hasLoadedPlayer: loaded,
    playerStateRef: { current: state },
    restoreStrikeInFlight: { current: false },
    setPlayerState: (update) => updates.push(update),
    setIsRestoringStrike: (value) => loadingUpdates.push(value),
    showRewardedAd: (reward, error, finished) => requests.push({ reward, error, finished }),
    Alert: { alert: (...args) => alerts.push(args) },
  };
  vm.runInNewContext(callbackCode, context);
  return {
    ...context.exports,
    requests,
    alerts,
    context,
    queueState: (update) => updates.push(update),
    commit() {
      for (const update of updates.splice(0)) state = typeof update === 'function' ? update(state) : update;
      for (const value of loadingUpdates.splice(0)) loading = value;
      context.playerStateRef.current = state;
    },
    get state() { return state; },
    get loading() { return loading; },
  };
}

test('failure deducts 10 strike and one heart; both clamp at zero', () => {
  const h = harness(35);
  h.handleFailLevel();
  assert.equal(h.state.strike, 35, 'React has not committed the update yet');
  h.commit();
  assert.equal(h.state.strike, 25);
  assert.equal(h.state.hearts, 2);
  assert.equal(h.state.coins, 125);

  h.queueState((state) => ({ ...state, strike: 4, hearts: 0 }));
  h.commit();
  h.handleFailLevel();
  h.commit();
  assert.equal(h.state.strike, 0);
  assert.equal(h.state.hearts, 0);
});

test('restoration requires loaded progress with no positive strike', () => {
  const positive = harness(30);
  positive.handleRestoreStrike();
  assert.equal(positive.requests.length, 0);
  const unloaded = harness(0, false);
  unloaded.handleRestoreStrike();
  assert.equal(unloaded.requests.length, 0);
});

test('double-tap lock takes effect before a render and only earned reward restores strike', () => {
  const h = harness();
  let successes = 0;
  h.handleRestoreStrike(() => successes++);
  h.handleRestoreStrike(() => successes++);
  assert.equal(h.requests.length, 1);
  assert.equal(h.loading, false, 'UI loading state has not committed yet');
  assert.equal(h.context.restoreStrikeInFlight.current, true);
  h.commit();
  assert.equal(h.loading, true);
  assert.equal(h.state.strike, 0);

  h.requests[0].reward();
  h.requests[0].reward();
  assert.equal(successes, 1);
  assert.equal(h.state.strike, 0, 'Reward update is still queued');
  h.commit();
  assert.equal(h.state.strike, 10);
  assert.equal(h.state.strikeZeroFails, 0);
  assert.equal(h.state.coins, 125);
  assert.equal(h.loading, true, 'Lock remains until ad lifecycle finishes');
  h.requests[0].finished();
  h.commit();
  assert.equal(h.loading, false);
  assert.equal(h.context.restoreStrikeInFlight.current, false);
});

test('closing without a reward leaves strike zero and permits a later retry', () => {
  const h = harness();
  let successes = 0;
  h.handleRestoreStrike(() => successes++);
  h.commit();
  h.requests[0].finished();
  h.commit();
  assert.equal(h.state.strike, 0);
  assert.equal(h.loading, false);
  assert.equal(successes, 0);
  assert.equal(h.alerts.length, 0);
  h.handleRestoreStrike();
  assert.equal(h.requests.length, 2);
});

test('ad error followed by lifecycle finish unlocks retry without giving strike', () => {
  const h = harness();
  h.handleRestoreStrike();
  h.commit();
  h.requests[0].error();
  h.requests[0].finished();
  h.commit();
  assert.equal(h.state.strike, 0);
  assert.equal(h.loading, false);
  assert.equal(h.alerts.length, 1);
  assert.equal(h.alerts[0][0], 'Ad Unavailable');
  h.handleRestoreStrike();
  assert.equal(h.requests.length, 2);
});

test('restore preserves a positive strike update queued while the ad is open', () => {
  const h = harness();
  h.handleRestoreStrike();
  h.queueState((state) => ({ ...state, strike: 50, coins: 200 }));
  assert.equal(h.context.playerStateRef.current.strike, 0);
  h.requests[0].reward();
  h.requests[0].finished();
  h.commit();
  assert.equal(h.state.strike, 50);
  assert.equal(h.state.coins, 200);
});

test('late reward and repeated finish cannot change state or unlock another request', () => {
  const h = harness();
  let successes = 0;
  h.handleRestoreStrike(() => successes++);
  h.requests[0].finished();
  h.handleRestoreStrike();
  h.requests[0].reward();
  h.requests[0].finished();
  h.commit();
  assert.equal(h.state.strike, 0);
  assert.equal(successes, 0);
  assert.equal(h.context.restoreStrikeInFlight.current, true);
  assert.equal(h.loading, true);
});
