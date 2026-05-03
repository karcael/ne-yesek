import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FOODS, PRESETS, VALID_TAGS } from '../src/data.js';

test('VALID_TAGS includes the source tags', () => {
  assert.ok(VALID_TAGS.includes('siparis'));
  assert.ok(VALID_TAGS.includes('ev'));
});

test('every food has a unique id', () => {
  const ids = FOODS.map(f => f.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate food ids found');
});

test('every food has at least one source tag', () => {
  for (const food of FOODS) {
    const hasSource = food.tags.includes('siparis') || food.tags.includes('ev');
    assert.ok(hasSource, `food "${food.id}" has no source tag (siparis or ev)`);
  }
});

test('every food tag is a valid tag', () => {
  for (const food of FOODS) {
    for (const tag of food.tags) {
      assert.ok(VALID_TAGS.includes(tag), `food "${food.id}" has invalid tag "${tag}"`);
    }
  }
});

test('every food has required fields', () => {
  for (const food of FOODS) {
    assert.equal(typeof food.id, 'string');
    assert.equal(typeof food.name, 'string');
    assert.ok(Array.isArray(food.tags));
  }
});

test('every preset has id, name, and tag (or null)', () => {
  for (const preset of PRESETS) {
    assert.equal(typeof preset.id, 'string');
    assert.equal(typeof preset.name, 'string');
    assert.ok(preset.tag === null || typeof preset.tag === 'string');
  }
});

test('every non-null preset tag exists in VALID_TAGS', () => {
  for (const preset of PRESETS) {
    if (preset.tag !== null) {
      assert.ok(VALID_TAGS.includes(preset.tag), `preset "${preset.id}" uses unknown tag "${preset.tag}"`);
    }
  }
});

test('PRESETS has the expected 8 presets in correct order', () => {
  const ids = PRESETS.map(p => p.id);
  assert.deepEqual(ids, ['hepsi', 'siparis', 'ev-yemegi', 'diyet', 'vejetaryen', 'vegan', 'fast-food', 'tatli']);
});

test('first preset is "hepsi" with tag null (default, no filter)', () => {
  assert.equal(PRESETS[0].id, 'hepsi');
  assert.equal(PRESETS[0].tag, null);
});

test('vegan foods are also tagged vejetaryen', () => {
  const veganFoods = FOODS.filter(f => f.tags.includes('vegan'));
  assert.ok(veganFoods.length > 0, 'expected at least one vegan food');
  for (const food of veganFoods) {
    assert.ok(food.tags.includes('vejetaryen'), `vegan food "${food.id}" must also be vejetaryen`);
  }
});

test('FOODS has between 30 and 50 entries', () => {
  assert.ok(FOODS.length >= 30 && FOODS.length <= 50, `expected 30-50 foods, got ${FOODS.length}`);
});
