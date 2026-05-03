# Mimari

## Genel Yapı

Tek sayfa, statik web uygulaması. Beş ES modülü:

| Modül | Sorumluluk |
|---|---|
| `src/data.js` | `FOODS`, `PRESETS`, `VALID_TAGS` sabit verileri |
| `src/state.js` | `createStore({ storage, foods, presets })` factory: in-memory state, localStorage IO, mutation API, subscribe |
| `src/slot.js` | `createSlot({ slotElement })`: slot reel DOM yapısı, animasyon, rastgele seçim |
| `src/ui.js` | DOM render yardımcıları (preset chip'leri, info alanı, drawer içeriği, boş durum) |
| `src/app.js` | Giriş noktası: modülleri kurar, event listener'ları bağlar, render orkestrasyonu |

## Bağımlılık Grafiği

```
app.js -> data.js
       -> state.js  (storage parametresi: localStorage)
       -> slot.js
       -> ui.js
```

`data.js`, `state.js`, `slot.js`, `ui.js` birbirini import etmez (yatay bağımlılık yok). Yalnızca `app.js` dikey orkestrasyon yapar.

## State

Tek store, `createStore()` ile oluşturulur. Persisted alanlar:

```json
{
  "schemaVersion": 1,
  "activePresetId": "hepsi",
  "hiddenFoodIds": ["..."]
}
```

`localStorage` anahtarı: `ne-yesek:state`. Yazma her mutation sonrası eager. Okuma sadece init'te.

Runtime-only alanlar (`isSpinning`, `lastResult`) `slot.js` içinde tutulur.

## Test

`tests/data.test.js`: veri bütünlüğü (unique id, geçerli tag, kaynak tag zorunluluğu).
`tests/state.test.js`: store init, persist, mutation, filter.

Çalıştırma: `npm test` (Node 20+ built-in `node:test`).

UI ve animasyon için otomatik test yok; manuel checklist ile doğrulanır.

## Render Akışı

1. `app.js` `renderAll()` çağırır.
2. `state.getEffectiveFoods()` ile preset filtresi ve gizleme uygulanır.
3. Boş havuz: `renderEmptyState()`. Aksi halde: `slot.render(effective)`.
4. `state.onChange()` mutation sonrası `renderAll()`'i tekrar tetikler.

## Animasyon

CSS `transform: translateY()` ve `transition`. Reel havuzu 5 kez tekrarlı dizilir (yeterli kaydırma mesafesi). Hedef indeks rastgele seçilir, son tekrara animasyonla gidilir, sonra orta tekrara snap edilir (sonraki spin için pozisyon).

`prefers-reduced-motion: reduce` aktifse animasyon süresi sıfırlanır, sonuç anında set edilir, kısa flash efekti gösterilir.

`transitionend` watchdog: `setTimeout(duration + 200)` ile event tetiklenmezse de state temizlenir.

## Hata Yönetimi

- Bozuk localStorage: parse hatası yakalanır, default state, eski veri silinir.
- Yazma başarısız: sessizce geçilir, runtime state çalışır.
- `crypto` yoksa: `Math.random()` fallback.
- NES.css CDN ulaşılmazsa: `styles.css` minimal fallback styling sağlar (proje çalışır, çıplak görünür).
