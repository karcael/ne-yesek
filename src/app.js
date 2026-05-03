import { FOODS, PRESETS } from './data.js';
import { createStore } from './state.js';
import { createSlot } from './slot.js';
import {
  renderPresetChips,
  renderInfoArea,
  renderDrawerCounter,
  renderFoodList,
  renderEmptyState,
} from './ui.js';

const els = {
  presetChips: document.getElementById('preset-chips'),
  slot: document.getElementById('slot'),
  info: document.getElementById('info'),
  spin: document.getElementById('spin'),
  openDrawer: document.getElementById('open-drawer'),
  drawer: document.getElementById('drawer'),
  closeDrawer: document.getElementById('close-drawer'),
  drawerCounter: document.getElementById('drawer-counter'),
  foodList: document.getElementById('food-list'),
  showAll: document.getElementById('show-all'),
};

const store = createStore({
  storage: globalThis.localStorage,
  foods: FOODS,
  presets: PRESETS,
});

let slot = null;

function getActivePreset() {
  return PRESETS.find(p => p.id === store.getActivePresetId()) ?? PRESETS[0];
}

function renderAll() {
  const effective = store.getEffectiveFoods();
  const preset = getActivePreset();

  renderPresetChips({
    container: els.presetChips,
    presets: PRESETS,
    activePresetId: preset.id,
    onSelect: (id) => store.setActivePreset(id),
  });

  renderInfoArea({
    element: els.info,
    presetName: preset.name,
    effectiveCount: effective.length,
  });

  if (effective.length === 0) {
    renderEmptyState({ slotElement: els.slot });
    els.spin.disabled = true;
    return;
  }

  els.spin.disabled = false;

  if (!slot) {
    slot = createSlot({ slotElement: els.slot });
  } else {
    // Recreate slot DOM if it was replaced by empty state.
    if (!els.slot.querySelector('.slot-reel')) {
      slot = createSlot({ slotElement: els.slot });
    }
  }
  slot.render(effective);
}

function renderDrawer() {
  const effective = store.getEffectiveFoods();
  const hidden = store.getHiddenFoodIds();
  renderDrawerCounter({
    element: els.drawerCounter,
    effectiveCount: effective.length,
    totalCount: FOODS.length,
  });
  renderFoodList({
    container: els.foodList,
    foods: FOODS,
    hiddenFoodIds: hidden,
    onToggle: (id) => store.toggleHidden(id),
  });
}

store.onChange(() => {
  renderAll();
  if (els.drawer.open) renderDrawer();
});

els.spin.addEventListener('click', () => {
  if (!slot || slot.isSpinning()) return;
  els.spin.disabled = true;
  slot.spin({
    onResult: () => {
      els.spin.disabled = false;
      els.spin.textContent = 'TEKRAR ÇEVİR';
    },
  });
});

els.openDrawer.addEventListener('click', () => {
  renderDrawer();
  els.drawer.showModal();
});

els.closeDrawer.addEventListener('click', () => els.drawer.close());

els.showAll.addEventListener('click', () => {
  store.showAll();
  renderDrawer();
});

els.drawer.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') els.drawer.close();
});

renderAll();
