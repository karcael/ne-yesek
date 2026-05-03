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
