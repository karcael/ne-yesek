const STORAGE_KEY = 'ne-yesek:state';
const SCHEMA_VERSION = 1;

export function createStore({ storage, foods, presets }) {
  const foodIds = new Set(foods.map(f => f.id));
  const presetById = new Map(presets.map(p => [p.id, p]));
  const listeners = new Set();

  let activePresetId = 'hepsi';
  let hiddenFoodIds = new Set();

  load();

  function load() {
    const raw = safeRead();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.schemaVersion !== SCHEMA_VERSION) return;
      if (typeof parsed.activePresetId === 'string' && presetById.has(parsed.activePresetId)) {
        activePresetId = parsed.activePresetId;
      }
      if (Array.isArray(parsed.hiddenFoodIds)) {
        hiddenFoodIds = new Set(parsed.hiddenFoodIds.filter(id => foodIds.has(id)));
      }
    } catch {
      safeRemove();
    }
  }

  function persist() {
    const payload = JSON.stringify({
      schemaVersion: SCHEMA_VERSION,
      activePresetId,
      hiddenFoodIds: [...hiddenFoodIds],
    });
    safeWrite(payload);
  }

  function safeRead() {
    try { return storage.getItem(STORAGE_KEY); } catch { return null; }
  }

  function safeWrite(value) {
    try { storage.setItem(STORAGE_KEY, value); } catch { /* ignore quota or access errors */ }
  }

  function safeRemove() {
    try { storage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  function emitChange() {
    for (const cb of listeners) {
      try { cb(); } catch (err) { console.error('state listener error', err); }
    }
  }

  return {
    getActivePresetId: () => activePresetId,
    getHiddenFoodIds: () => new Set(hiddenFoodIds),

    setActivePreset(id) {
      if (!presetById.has(id) || activePresetId === id) return;
      activePresetId = id;
      persist();
      emitChange();
    },

    toggleHidden(foodId) {
      if (!foodIds.has(foodId)) return;
      if (hiddenFoodIds.has(foodId)) hiddenFoodIds.delete(foodId);
      else hiddenFoodIds.add(foodId);
      persist();
      emitChange();
    },

    showAll() {
      if (hiddenFoodIds.size === 0) return;
      hiddenFoodIds = new Set();
      persist();
      emitChange();
    },

    getEffectiveFoods() {
      const preset = presetById.get(activePresetId);
      const tag = preset?.tag ?? null;
      return foods.filter(food => {
        if (hiddenFoodIds.has(food.id)) return false;
        if (tag !== null && !food.tags.includes(tag)) return false;
        return true;
      });
    },

    onChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}
