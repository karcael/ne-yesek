import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/state.js';

function createMockStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = String(v); },
    removeItem: (k) => { delete data[k]; },
    _data: data,
  };
}

const FOODS = [
  { id: 'a', name: 'A', tags: ['siparis', 'fast-food'] },
  { id: 'b', name: 'B', tags: ['siparis', 'vejetaryen'] },
  { id: 'c', name: 'C', tags: ['ev', 'vejetaryen', 'vegan'] },
  { id: 'd', name: 'D', tags: ['siparis', 'ev'] },
];

const PRESETS = [
  { id: 'hepsi', name: 'Hepsi', tag: null },
  { id: 'siparis', name: 'Sipariş', tag: 'siparis' },
  { id: 'ev-yemegi', name: 'Ev Yemeği', tag: 'ev' },
  { id: 'vejetaryen', name: 'Vejetaryen', tag: 'vejetaryen' },
  { id: 'vegan', name: 'Vegan', tag: 'vegan' },
];

test('init from empty storage uses defaults', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  assert.equal(store.getActivePresetId(), 'hepsi');
  assert.deepEqual([...store.getHiddenFoodIds()], []);
});

test('init reads valid stored state', () => {
  const storage = createMockStorage({
    'ne-yesek:state': JSON.stringify({ schemaVersion: 1, activePresetId: 'vegan', hiddenFoodIds: ['a'] }),
  });
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  assert.equal(store.getActivePresetId(), 'vegan');
  assert.deepEqual([...store.getHiddenFoodIds()], ['a']);
});

test('init falls back to defaults on corrupt JSON and clears storage', () => {
  const storage = createMockStorage({ 'ne-yesek:state': '{not valid json' });
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  assert.equal(store.getActivePresetId(), 'hepsi');
  assert.deepEqual([...store.getHiddenFoodIds()], []);
  assert.equal(storage._data['ne-yesek:state'], undefined);
});

test('init drops hidden ids that no longer exist in FOODS', () => {
  const storage = createMockStorage({
    'ne-yesek:state': JSON.stringify({ schemaVersion: 1, activePresetId: 'hepsi', hiddenFoodIds: ['a', 'gone', 'b'] }),
  });
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  assert.deepEqual([...store.getHiddenFoodIds()].sort(), ['a', 'b']);
});

test('init falls back to "hepsi" if active preset is unknown', () => {
  const storage = createMockStorage({
    'ne-yesek:state': JSON.stringify({ schemaVersion: 1, activePresetId: 'unknown-preset', hiddenFoodIds: [] }),
  });
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  assert.equal(store.getActivePresetId(), 'hepsi');
});

test('setActivePreset updates state and persists', () => {
  const storage = createMockStorage();
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  store.setActivePreset('vegan');
  assert.equal(store.getActivePresetId(), 'vegan');
  const persisted = JSON.parse(storage._data['ne-yesek:state']);
  assert.equal(persisted.activePresetId, 'vegan');
});

test('setActivePreset ignores unknown preset id', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  store.setActivePreset('bogus');
  assert.equal(store.getActivePresetId(), 'hepsi');
});

test('toggleHidden adds and removes ids', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  store.toggleHidden('a');
  assert.ok(store.getHiddenFoodIds().has('a'));
  store.toggleHidden('a');
  assert.ok(!store.getHiddenFoodIds().has('a'));
});

test('toggleHidden ignores unknown food ids', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  store.toggleHidden('bogus');
  assert.equal(store.getHiddenFoodIds().size, 0);
});

test('showAll clears hiddenFoodIds and persists', () => {
  const storage = createMockStorage({
    'ne-yesek:state': JSON.stringify({ schemaVersion: 1, activePresetId: 'hepsi', hiddenFoodIds: ['a', 'b'] }),
  });
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  store.showAll();
  assert.equal(store.getHiddenFoodIds().size, 0);
  const persisted = JSON.parse(storage._data['ne-yesek:state']);
  assert.deepEqual(persisted.hiddenFoodIds, []);
});

test('getEffectiveFoods with "hepsi" preset returns all non-hidden foods', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  assert.equal(store.getEffectiveFoods().length, 4);
  store.toggleHidden('a');
  assert.equal(store.getEffectiveFoods().length, 3);
});

test('getEffectiveFoods filters by preset tag', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  store.setActivePreset('vejetaryen');
  const ids = store.getEffectiveFoods().map(f => f.id);
  assert.deepEqual(ids.sort(), ['b', 'c']);
});

test('getEffectiveFoods combines preset and hidden filters', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  store.setActivePreset('vejetaryen');
  store.toggleHidden('b');
  const ids = store.getEffectiveFoods().map(f => f.id);
  assert.deepEqual(ids, ['c']);
});

test('onChange fires after mutations', () => {
  const store = createStore({ storage: createMockStorage(), foods: FOODS, presets: PRESETS });
  let count = 0;
  store.onChange(() => { count += 1; });
  store.setActivePreset('vegan');
  store.toggleHidden('a');
  store.showAll();
  assert.equal(count, 3);
});

test('storage write failure does not throw', () => {
  const storage = {
    getItem: () => null,
    setItem: () => { throw new Error('quota exceeded'); },
    removeItem: () => {},
  };
  const store = createStore({ storage, foods: FOODS, presets: PRESETS });
  assert.doesNotThrow(() => store.setActivePreset('vegan'));
  assert.equal(store.getActivePresetId(), 'vegan');
});
