// Renders the horizontal preset filter chips.
// Highlights the active preset; calls onSelect(presetId) when a chip is clicked.
export function renderPresetChips({ container, presets, activePresetId, onSelect }) {
  container.innerHTML = '';
  for (const preset of presets) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = preset.id === activePresetId
      ? 'nes-btn is-primary'
      : 'nes-btn';
    btn.textContent = preset.name;
    btn.dataset.presetId = preset.id;
    btn.setAttribute('aria-pressed', String(preset.id === activePresetId));
    btn.addEventListener('click', () => onSelect(preset.id));
    container.appendChild(btn);
  }
}

// Renders the single-line info text under the slot.
// Format: "<PresetName>: <count> yemek aktif"
export function renderInfoArea({ element, presetName, effectiveCount }) {
  element.textContent = `${presetName}: ${effectiveCount} yemek aktif`;
}

// Renders the drawer counter line.
// Format: "Aktif: <effective>/<total>"
export function renderDrawerCounter({ element, effectiveCount, totalCount }) {
  element.textContent = `Aktif: ${effectiveCount} / ${totalCount}`;
}

// Renders the full food list inside the drawer.
// onToggle(foodId) is called when a checkbox is toggled.
export function renderFoodList({ container, foods, hiddenFoodIds, onToggle }) {
  container.innerHTML = '';
  for (const food of foods) {
    const li = document.createElement('li');
    li.className = 'food-list-item';
    const isHidden = hiddenFoodIds.has(food.id);

    const label = document.createElement('label');
    label.className = 'nes-text';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'nes-checkbox';
    checkbox.checked = !isHidden;
    checkbox.dataset.foodId = food.id;
    checkbox.addEventListener('change', () => onToggle(food.id));

    const span = document.createElement('span');
    span.textContent = ` ${food.emoji ?? ''} ${food.name}`;

    label.appendChild(checkbox);
    label.appendChild(span);
    li.appendChild(label);
    if (isHidden) li.classList.add('food-list-item--hidden');
    container.appendChild(li);
  }
}

// Renders an empty-state message into the slot when no foods are available.
export function renderEmptyState({ slotElement }) {
  slotElement.innerHTML = '';
  const msg = document.createElement('p');
  msg.className = 'slot-empty';
  msg.textContent = 'Aktif yemek yok. Listeden geri açmayı veya preset değiştirmeyi dene.';
  slotElement.appendChild(msg);
}
