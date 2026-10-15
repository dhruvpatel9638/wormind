const assert = require('node:assert/strict');
const { test } = require('node:test');
const { setImmediate: nextTurn } = require('node:timers/promises');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../src/utils/admobService.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function harness(options = {}) {
  const listeners = new Map();
  const registered = new Map();
  const calls = [];
  let shows = 0;
  const failure = new Error('Mock SDK failure');
  const ad = {
    addAdEventListener(event, callback) {
      if (options.registrationError === event) throw failure;
      listeners.set(event, callback);
      registered.set(event, callback);
      return () => listeners.delete(event);
    },
    load() {
      if (options.loadError) throw failure;
      if (options.loadRejection) return Promise.reject(failure);
    },
    show() {
      shows += 1;
      if (options.showError) throw failure;
      if (options.showRejection) return Promise.reject(failure);
      return Promise.resolve();
    },
  };
  const sdk = {
    RewardedInterstitialAd: { createForAdRequest() {
      if (options.createError) throw failure;
      return ad;
    } },
    AdEventType: { CLOSED: 'closed', ERROR: 'error' },
    RewardedAdEventType: { LOADED: 'loaded', EARNED_REWARD: 'earned' },
  };
  const context = {
    exports: {},
    require(name) {
      if (name === 'react-native-google-mobile-ads') return sdk;
      if (name === '../config/admob') return { ADMOB_CONFIG: { REWARDED_INTERSTITIAL_ID: 'test' } };
      throw new Error(`Unexpected import: ${name}`);
    },
    console: { log() {}, warn() {} },
  };
  vm.runInNewContext(compiled, context);
  return {
    calls, listeners, registered,
    get shows() { return shows; },
    start(...callbacks) {
      context.exports.showRewardedAd(...(callbacks.length ? callbacks : [
        () => calls.push('reward'),
        () => calls.push('error'),
        () => calls.push('finished'),
      ]));
    },
    emit(event) { listeners.get(event)?.(failure); },
  };
}

test('earned reward waits for closure and duplicate or stale events cannot grant twice', () => {
  const ad = harness();
  ad.start();
  ad.emit('loaded');
  ad.emit('loaded');
  assert.equal(ad.shows, 1);
  ad.emit('earned');
  ad.emit('earned');
  assert.deepEqual(ad.calls, []);
  ad.emit('closed');
  assert.deepEqual(ad.calls, ['reward', 'finished']);
  assert.equal(ad.listeners.size, 0);
  for (const callback of ad.registered.values()) callback(new Error('Late event'));
  assert.deepEqual(ad.calls, ['reward', 'finished']);
  assert.equal(ad.shows, 1);
});

test('closing without earned reward finishes and cleans up without granting', () => {
  const ad = harness();
  ad.start();
  ad.emit('loaded');
  ad.emit('closed');
  ad.registered.get('earned')();
  ad.registered.get('closed')();
  assert.deepEqual(ad.calls, ['finished']);
  assert.equal(ad.listeners.size, 0);
});

for (const earned of [false, true]) {
  test(`an SDK error finishes without reward, including earned=${earned}`, () => {
    const ad = harness();
    ad.start();
    if (earned) ad.emit('earned');
    ad.emit('error');
    ad.registered.get('closed')();
    ad.registered.get('error')(new Error('Repeated failure'));
    assert.deepEqual(ad.calls, ['error', 'finished']);
    assert.equal(ad.listeners.size, 0);
  });
}

for (const failure of ['createError', 'loadError', 'loadRejection', 'showError', 'showRejection']) {
  test(`${failure} releases the caller lock once without granting`, async () => {
    const ad = harness({ [failure]: true });
    ad.start();
    if (failure.startsWith('show')) ad.emit('loaded');
    await nextTurn();
    assert.deepEqual(ad.calls, ['error', 'finished']);
    assert.equal(ad.listeners.size, 0);
  });
}

test('partial listener registration failure removes earlier listeners and finishes', () => {
  const ad = harness({ registrationError: 'closed' });
  ad.start();
  assert.deepEqual(ad.calls, ['error', 'finished']);
  assert.equal(ad.listeners.size, 0);
});

test('completion still unlocks the caller if its reward callback throws', () => {
  const ad = harness();
  let finished = 0;
  ad.start(() => { throw new Error('Reward callback failure'); }, undefined, () => finished++);
  ad.emit('earned');
  assert.throws(() => ad.emit('closed'), /Reward callback failure/);
  assert.equal(finished, 1);
  assert.equal(ad.listeners.size, 0);
});

test('existing one- and two-callback callers remain supported', () => {
  const rewarded = harness();
  let rewards = 0;
  rewarded.start(() => rewards++);
  rewarded.emit('earned');
  rewarded.emit('closed');
  assert.equal(rewards, 1);
  const failed = harness();
  let errors = 0;
  failed.start(() => rewards++, () => errors++);
  failed.emit('error');
  assert.equal(errors, 1);
  assert.equal(rewards, 1);
});
