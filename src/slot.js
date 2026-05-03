const ITEM_HEIGHT = 60;
const VISIBLE_ITEMS = 5;
const REPEATS = 5;
const SPIN_DURATION_MS = 2500;
const EASING = 'cubic-bezier(0.15, 0.85, 0.3, 1)';

export function createSlot({ slotElement }) {
  let pool = [];
  let currentIndex = 0;
  let isSpinning = false;
  let reelEl = null;

  buildSkeleton();

  function buildSkeleton() {
    slotElement.innerHTML = '';
    slotElement.style.position = 'relative';
    slotElement.style.height = `${ITEM_HEIGHT * VISIBLE_ITEMS}px`;

    reelEl = document.createElement('div');
    reelEl.className = 'slot-reel';
    reelEl.style.position = 'absolute';
    reelEl.style.left = '0';
    reelEl.style.right = '0';
    reelEl.style.willChange = 'transform';
    slotElement.appendChild(reelEl);

    const highlight = document.createElement('div');
    highlight.className = 'slot-highlight';
    highlight.setAttribute('aria-hidden', 'true');
    slotElement.appendChild(highlight);
  }

  function render(activePool) {
    pool = activePool;
    if (pool.length === 0) {
      reelEl.innerHTML = '';
      return;
    }
    currentIndex = pickRandomIndex(pool.length);
    const items = [];
    for (let r = 0; r < REPEATS; r++) {
      for (const food of pool) items.push(food);
    }
    reelEl.innerHTML = items
      .map(food => `<div class="slot-item" style="height:${ITEM_HEIGHT}px">${food.emoji ?? ''} ${food.name}</div>`)
      .join('');
    snapTo(currentIndex);
  }

  function snapTo(index) {
    // Place 'index' (relative to pool) under the centered highlight, using middle repeat.
    const middleRepeat = Math.floor(REPEATS / 2);
    const flatIndex = middleRepeat * pool.length + index;
    const y = flatIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
    reelEl.style.transition = 'none';
    reelEl.style.transform = `translateY(-${y}px)`;
    // Force reflow so subsequent transitions take effect.
    void reelEl.offsetHeight;
  }

  function pickRandomIndex(length) {
    if (length === 0) return 0;
    const cryptoObj = globalThis.crypto;
    if (cryptoObj?.getRandomValues) {
      const buf = new Uint32Array(1);
      cryptoObj.getRandomValues(buf);
      return buf[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function prefersReducedMotion() {
    return globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  function spin({ onResult }) {
    if (isSpinning || pool.length === 0) return;
    isSpinning = true;

    const targetIndex = pickRandomIndex(pool.length);
    const middleRepeat = Math.floor(REPEATS / 2);
    const lastRepeat = REPEATS - 1;
    const targetFlatIndex = lastRepeat * pool.length + targetIndex;
    const targetY = targetFlatIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

    const duration = prefersReducedMotion() ? 0 : SPIN_DURATION_MS;

    function finish() {
      currentIndex = targetIndex;
      // Snap back to the middle repeat at the same logical index for next spin.
      const middleFlatIndex = middleRepeat * pool.length + targetIndex;
      const middleY = middleFlatIndex * ITEM_HEIGHT - Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;
      reelEl.style.transition = 'none';
      reelEl.style.transform = `translateY(-${middleY}px)`;
      isSpinning = false;
      onResult(pool[targetIndex]);
    }

    if (duration === 0) {
      reelEl.style.transition = 'none';
      reelEl.style.transform = `translateY(-${targetY}px)`;
      slotElement.classList.add('slot--flash');
      setTimeout(() => slotElement.classList.remove('slot--flash'), 200);
      finish();
      return;
    }

    let settled = false;
    const onEnd = () => {
      if (settled) return;
      settled = true;
      reelEl.removeEventListener('transitionend', onEnd);
      finish();
    };
    reelEl.addEventListener('transitionend', onEnd, { once: true });
    setTimeout(onEnd, duration + 200); // watchdog

    reelEl.style.transition = `transform ${duration}ms ${EASING}`;
    requestAnimationFrame(() => {
      reelEl.style.transform = `translateY(-${targetY}px)`;
    });
  }

  return {
    render,
    isSpinning: () => isSpinning,
    spin,
  };
}
