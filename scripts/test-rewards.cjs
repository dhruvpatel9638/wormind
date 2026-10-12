require('tsx/cjs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const {
  createInitialPlayerState, restorePlayerState, rewardAvailability, claimDailyReward,
  startDailySpin, completeDailySpin, spendHint, localDayKey, millisecondsToNextDay,
} = require('../src/native/rewardLogic.ts');
const { SPIN_PRIZES, spinTargetAngle } = require('../src/data/spinPrizes.ts');
const { DAILY_REWARDS } = require('../src/data/gameData.ts');
const date = (day, hour = 12) => new Date(2026, 9, day, hour);

test('fresh players and legacy undated demo claims start on Day 1', () => {
  const state = createInitialPlayerState();
  assert.equal(rewardAvailability(state, date(11)).currentDay, 1);
  assert.equal(state.streak, 0);
  const migrated = restorePlayerState({ ...state, claimedDays: [1, 2, 3, 4], streak: 5 });
  assert.deepEqual(migrated.claimedDays, []);
  assert.equal(migrated.streak, 0);
});

test('restoring valid progress preserves large balances, dates and daily claims', () => {
  const state = { ...createInitialPlayerState(), coins: 12345, claimedDays: [1, 2],
    lastDailyClaimDate: '2026-10-10', streak: 2, lastSpinDate: '2026-10-10' };
  const restored = restorePlayerState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.coins, 12345);
  assert.deepEqual(restored.claimedDays, [1, 2]);
  assert.equal(restored.streak, 2);
  assert.equal(restored.lastSpinDate, '2026-10-10');
});

test('daily claims are idempotent and cannot skip to jackpot or invalid days', () => {
  const state = createInitialPlayerState();
  for (const day of [0, 2, 7, 8, NaN]) assert.equal(claimDailyReward(state, day, date(11)), state);
  const claimed = claimDailyReward(state, 1, date(11));
  assert.equal(claimed.coins, state.coins + 50);
  assert.equal(claimDailyReward(claimed, 1, date(11)), claimed);
  assert.equal(claimDailyReward(claimed, 2, date(11)), claimed);
});

test('seven-day cycle grants every advertised reward and restarts the next day', () => {
  let state = createInitialPlayerState();
  for (let day = 1; day <= 7; day++) {
    state = claimDailyReward(state, day, date(day));
    state = restorePlayerState(JSON.parse(JSON.stringify(state)));
  }
  assert.equal(state.coins, 1280);
  assert.equal(state.xp, 0);
  assert.ok(state.unlockedHats.includes('loki'));
  assert.equal(state.streak, 7);
  assert.equal(rewardAvailability(state, date(7)).canClaimDaily, false);
  assert.equal(rewardAvailability(state, date(8)).currentDay, 1);
  state = claimDailyReward(state, 1, date(8));
  assert.deepEqual(state.claimedDays, [1]);
  assert.equal(state.streak, 8);
  for (let day = 2; day <= 7; day++) state = claimDailyReward(state, day, date(day + 7));
  assert.equal(state.unlockedHats.filter((hat) => hat === 'loki').length, 1);
});

test('missing a day resets the streak but retains login reward progression', () => {
  let state = claimDailyReward(createInitialPlayerState(), 1, date(1));
  assert.equal(rewardAvailability(state, date(3)).streak, 0);
  assert.equal(rewardAvailability(state, date(3)).currentDay, 2);
  state = claimDailyReward(state, 2, date(3));
  assert.equal(state.streak, 1);
  assert.deepEqual(state.claimedDays, [1, 2]);
});

test('local midnight unlocks rewards and timing handles DST boundaries', () => {
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Asia/Kolkata';
    const before = new Date('2026-10-11T23:59:59+05:30');
    const after = new Date('2026-10-12T00:00:00+05:30');
    assert.equal(localDayKey(after), '2026-10-12');
    assert.equal(millisecondsToNextDay(before), 1000);
    const state = claimDailyReward(createInitialPlayerState(), 1, before);
    assert.equal(rewardAvailability(state, after).canClaimDaily, true);
    process.env.TZ = 'America/New_York';
    assert.equal(millisecondsToNextDay(new Date(2026, 2, 8)), 23 * 3600000);
    assert.equal(millisecondsToNextDay(new Date(2026, 10, 1)), 25 * 3600000);
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('dates at action time prevent stale eligibility and clock rollback double claims', () => {
  let state = claimDailyReward(createInitialPlayerState(), 1, date(11));
  state = claimDailyReward(state, 2, date(12));
  assert.equal(state.lastDailyClaimDate, '2026-10-12');
  assert.equal(claimDailyReward(state, 3, date(12)), state);
  assert.equal(claimDailyReward(state, 3, date(11)), state);
});

test('hints cost 25 coins and cannot be used with an insufficient balance', () => {
  let state = { ...createInitialPlayerState(), coins: 25 };
  state = spendHint(state);
  assert.equal(state.coins, 0);
  assert.equal(spendHint(state), state);
});

test('every wheel slice awards only its displayed coin amount, once per day', () => {
  assert.deepEqual(SPIN_PRIZES.map((prize) => prize.amount), [50, 50, 100, 25, 25, 75, 250, 75]);
  SPIN_PRIZES.forEach((prize, index) => {
    assert.equal(prize.type, 'coins');
    let state = startDailySpin(createInitialPlayerState(), date(11), (index + 0.1) / 8);
    const ticket = state.pendingSpin;
    assert.equal(ticket.prizeIndex, index);
    state = completeDailySpin(state, ticket, date(11));
    assert.equal(state.coins, 100 + prize.amount);
    assert.equal(state.lastSpinDate, '2026-10-11');
    assert.equal(state.pendingSpin, null);
    assert.equal(completeDailySpin(state, ticket, date(11)), state);
    assert.equal(startDailySpin(state, date(11)), state);
    assert.equal(startDailySpin(state, date(10)), state);
  });
});

test('cancel/restart retains the same pending prize without consuming the daily spin', () => {
  const started = startDailySpin(createInitialPlayerState(), date(11), 0.8);
  const restored = restorePlayerState(JSON.parse(JSON.stringify(started)));
  const resumed = startDailySpin(restored, date(11), 0.1);
  assert.equal(resumed, restored);
  assert.deepEqual(resumed.pendingSpin, started.pendingSpin);
  assert.equal(resumed.coins, 100);
  assert.equal(resumed.lastSpinDate, null);
  assert.equal(completeDailySpin(resumed, { ...resumed.pendingSpin, id: 'stale' }, date(11)), resumed);
});

test('a spin crossing midnight consumes the completion day, with an atomic award', () => {
  const started = startDailySpin(createInitialPlayerState(), date(11, 23), 0.8);
  const completed = completeDailySpin(started, started.pendingSpin, date(12, 0));
  assert.equal(completed.coins, 350);
  assert.equal(completed.lastSpinDate, '2026-10-12');
  assert.equal(rewardAvailability(completed, date(12)).canSpinToday, false);
  assert.equal(rewardAvailability(completed, date(13)).canSpinToday, true);
});

test('all repeated spins rotate forwards at least five turns and land on the selected slice', () => {
  for (let first = 0; first < 8; first++) {
    let rotation = spinTargetAngle(0, first) % 360;
    for (let next = 0; next < 8; next++) {
      const target = spinTargetAngle(rotation, next);
      assert.ok(target - rotation >= 1800);
      assert.equal(((next + 0.5) * 45 + target) % 360, 270);
      rotation = target % 360;
    }
  }
});

// Run the real spin callback with controlled native animation completions.
function wheelHarness() {
  const source = fs.readFileSync(path.join(__dirname, '../src/native/components/LuckyWheel.tsx'), 'utf8');
  const ast = ts.createSourceFile('wheel.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let handler;
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.name.getText(ast) === 'handleSpin') handler = node.initializer.getText(ast);
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const value = () => ({ setValue() {} });
  const animations = [];
  let state = createInitialPlayerState(), starts = 0, completed = 0;
  const context = {
    exports: {}, spinningRef: { current: false }, mountedRef: { current: true }, canSpinToday: true,
    spinAnim: value(), needleWobbleAnim: value(), bannerScale: value(), currentRotation: { current: 0 },
    needleAnimationRef: { current: null }, spinAnimationRef: { current: null },
    setIsSpinning() {}, setWonPrize() {}, Alert: { alert() {} },
    nativeAudio: { playSparkle() {}, playVictory() {} },
    PRIZES: SPIN_PRIZES, spinTargetAngle,
    onStartSpin: () => { starts++; state = startDailySpin(state, date(11), 0.8); return state.pendingSpin; },
    onCompleteSpin: (ticket) => {
      const next = completeDailySpin(state, ticket, date(11));
      if (next === state) return false;
      state = next; completed++; return true;
    },
    Easing: { out: () => null, cubic: null },
    Animated: {
      timing: (_, config) => ({ start: (cb) => { if (config.duration === 3800) animations.push(cb); } }),
      sequence: () => ({}), loop: () => ({ start() {}, stop() {} }), spring: () => ({ start() {} }),
    },
  };
  vm.runInNewContext(ts.transpileModule(`exports.spin = ${handler};`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, context);
  return { spin: context.exports.spin, animations, context,
    get state() { return state; }, get starts() { return starts; }, get completed() { return completed; } };
}

test('double spin presses are locked synchronously; only finished animations award coins', () => {
  const h = wheelHarness();
  h.spin(); h.spin();
  assert.equal(h.starts, 1);
  h.animations[0]({ finished: false });
  assert.equal(h.completed, 0);
  assert.equal(h.state.lastSpinDate, null);
  const ticket = h.state.pendingSpin;
  h.spin();
  assert.deepEqual(h.state.pendingSpin, ticket);
  h.animations[1]({ finished: true });
  h.animations[1]({ finished: true });
  assert.equal(h.completed, 1);
  assert.equal(h.state.coins, 350);
});

test('an unmounted wheel cannot award or consume its unfinished spin', () => {
  const h = wheelHarness();
  h.spin();
  h.context.mountedRef.current = false;
  h.animations[0]({ finished: false });
  assert.equal(h.completed, 0);
  assert.equal(h.state.coins, 100);
  assert.equal(h.state.lastSpinDate, null);
});

function appRewardHarness(loaded = true) {
  const source = fs.readFileSync(path.join(__dirname, '../App.tsx'), 'utf8');
  const ast = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const declarations = {};
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && node.initializer) declarations[node.name.getText(ast)] = node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(ast);
  const now = date(11);
  const context = {
    exports: {}, hasLoadedPlayer: loaded, playerStateRef: { current: createInitialPlayerState() },
    setRenderedPlayerState() {}, DAILY_REWARDS, claimDailyReward, completeDailySpin, spendHint,
    Date: class extends Date { constructor(...args) { super(...(args.length ? args : [now.getTime()])); } },
    rewardAvailability: (s) => rewardAvailability(s, now),
    startDailySpin: (s) => startDailySpin(s, now, 0.8),
  };
  const updater = `(update) => {
    const next = typeof update === 'function' ? update(playerStateRef.current) : update;
    playerStateRef.current = next;
    setRenderedPlayerState(next);
  }`;
  const handlers = ['handleClaimDaily', 'handleStartSpin', 'handleCompleteSpin', 'handleUseHint'];
  const code = `const setPlayerState = ${updater};` + handlers.map((name) => `exports.${name} = ${declarations[name].getText(ast)};`).join('\n');
  vm.runInNewContext(ts.transpileModule(code, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText, context);
  return { handlers: context.exports, get state() { return context.playerStateRef.current; } };
}

test('App callbacks reject duplicate rewards before React commits another render', () => {
  const h = appRewardHarness();
  assert.equal(h.handlers.handleClaimDaily(1).coins, 50);
  assert.equal(h.handlers.handleClaimDaily(1), null);
  assert.equal(h.state.coins, 150);
  const ticket = h.handlers.handleStartSpin();
  assert.equal(h.handlers.handleStartSpin(), ticket);
  assert.equal(h.handlers.handleCompleteSpin(ticket), true);
  assert.equal(h.handlers.handleCompleteSpin(ticket), false);
  assert.equal(h.handlers.handleStartSpin(), null);
  assert.equal(h.state.coins, 400);
  assert.equal(h.handlers.handleUseHint(), true);
  assert.equal(h.handlers.handleUseHint(), true);
  assert.equal(h.state.coins, 350);
});

test('App keeps rewards locked until saved progress has loaded', () => {
  const h = appRewardHarness(false);
  assert.equal(h.handlers.handleClaimDaily(1), null);
  assert.equal(h.handlers.handleStartSpin(), null);
  assert.equal(h.handlers.handleUseHint(), false);
  assert.equal(h.state.coins, 100);
});
