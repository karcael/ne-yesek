# ne-yesek - Tasarım Dokümanı

**Tarih:** 2026-05-03
**Repo:** https://github.com/karcael/ne-yesek
**Durum:** Brainstorming tamamlandı, uygulamaya hazır.

## Amaç

"Bugün ne yesek?" sorusunun cevabını bulmak için harcanan zamanı saniyelere indiren statik bir slot makinesi web uygulaması.

**Birincil kullanım:** Evde yemek yokken sipariş kararı verirken yaşanan kararsızlığı çözmek.
**İkincil kullanım:** Evde basit bir şey yapma motivasyonu yokken fikir vermek.

## Hedef Kullanıcı ve Bağlam

- Birincil kullanıcı: proje sahibi, kişisel günlük kullanım için.
- İkincil kullanıcı: public repo'yu çekip kullanan veya kendi versiyonunu deploy eden Türkçe konuşan kişiler.
- Kullanım anı: çoğunlukla mobil cihazdan, akşam saatlerinde, hızlı karar verilmesi gereken durumda.

## Kapsam

### V1'de var

- Slot makinesi tarzı dikey kayan çark.
- Sabit bir Türk yemek listesi (yaklaşık 30-50 yemek).
- Tag bazlı preset filtreleri (tek aktif preset, radyo davranışı).
- Yemekleri tek tek gizleme ve geri açma.
- localStorage ile tercihlerin kalıcı olması.
- NES.css ile retro pixel estetik.
- Mobil öncelikli responsive tasarım.

### V1'de yok (scope dışı)

- Kullanıcı tarafından yemek ekleme.
- Çoklu aktif preset / kombine filtreleme.
- Sipariş uygulamalarına (Yemeksepeti, Getir, Trendyol Yemek) deep link.
- Çoklu liste / profil yönetimi.
- Hesap, üyelik, backend.
- Ses efekti.
- PWA (manifest, service worker).
- Otomatik test (manuel test checklist'i var).

## Teknik Mimari

### Teknoloji yığını

- HTML, CSS, vanilla JavaScript (ES2020+).
- NES.css (CDN: `https://unpkg.com/nes.css@latest/css/nes.min.css`).
- Google Fonts üzerinden "Press Start 2P".
- Native ES modülleri (`<script type="module">`).
- Build adımı yok, paket yöneticisi yok.

### Dosya yapısı

```
ne-yesek/
├── index.html              # Tek sayfa, semantik HTML
├── styles.css              # NES.css üzerine custom dokunuşlar
├── src/
│   ├── app.js              # Giriş noktası, init, event binding, render
│   ├── data.js             # FOODS, PRESETS, TAGS sabitleri
│   ├── state.js            # localStorage IO ve state mutation API'si
│   ├── slot.js             # Slot animasyon ve seçim mantığı
│   └── ui.js               # DOM render yardımcıları
├── README.md               # Proje özeti, ekran görüntüsü, kurulum
├── architecture.md         # Mimari karar dokümantasyonu
├── memory.md               # Çalışma notları
└── .gitignore              # .superpowers/, .DS_Store, .vscode vb.
```

### Modül sorumlulukları

- `data.js`: Sabit veri (yemekler, preset listesi, tag pool). Saf veri, fonksiyon yok.
- `state.js`: localStorage okuma/yazma, in-memory state, mutation fonksiyonları, `onChange` subscribe.
- `slot.js`: Slot reel'inin DOM yapısı, animasyon, rastgele indeks seçimi.
- `ui.js`: Preset chip'leri, drawer içeriği, sayaç, boş durum render fonksiyonları.
- `app.js`: Init, modüller arası bağlama, event listener kurulumu.

### Tasarım ilkeleri

- Modüllerin tek sorumluluğu vardır.
- DOM mutasyonu yalnızca `ui.js` ve `slot.js` içinde.
- State mutasyonu yalnızca `state.js` içinde.
- `app.js` orkestrasyon yapar, kendisi DOM'a dokunmaz.
- UI metinleri Türkçe, kod ve kod içi açıklamalar İngilizce.

### Deploy

- GitHub Pages: `main` branch root, otomatik.
- Kullanıcının kendi subdomain'i: aynı dosyaları herhangi bir static host'a koyma.

## Veri Modeli

### Yemek (Food)

```js
{
  id: 'lahmacun',          // slug, kalıcı kimlik (localStorage anahtarı)
  name: 'Lahmacun',        // UI'de görünen isim
  emoji: '🌯',             // küçük görsel ipucu (opsiyonel)
  tags: ['siparis', 'fast-food', 'et', 'hamur']
}
```

### Tag pool (sabit, kapalı küme)

| Kategori | Tag'ler |
|---|---|
| Kaynak | `siparis`, `ev` |
| Tema | `fast-food`, `ev-yemegi-klasik`, `corba`, `tatli` |
| Diyet | `vejetaryen`, `vegan`, `hafif` |
| İçerik | `et`, `hamur`, `pirinc`, `sebze` |

Bir yemek kaynak tag'lerinden en az birini taşımalıdır (`siparis` veya `ev` veya ikisi). Tema, diyet ve içerik tag'leri opsiyoneldir.

### Preset listesi

```js
const PRESETS = [
  { id: 'hepsi',      name: 'Hepsi',      tag: null },
  { id: 'siparis',    name: 'Sipariş',    tag: 'siparis' },
  { id: 'ev-yemegi',  name: 'Ev Yemeği',  tag: 'ev' },
  { id: 'diyet',      name: 'Diyet',      tag: 'hafif' },
  { id: 'vejetaryen', name: 'Vejetaryen', tag: 'vejetaryen' },
  { id: 'vegan',      name: 'Vegan',      tag: 'vegan' },
  { id: 'fast-food',  name: 'Fast Food',  tag: 'fast-food' },
  { id: 'tatli',      name: 'Tatlı',      tag: 'tatli' }
]
```

Filtre kuralı:

```js
const isInPreset = (food, preset) =>
  preset.tag === null || food.tags.includes(preset.tag);
```

Vegan-Vejetaryen ilişkisi: vegan yemekler hem `vegan` hem `vejetaryen` tag'ini taşır (vegan, vejetaryenin alt kümesidir).

### Persist edilen state (localStorage)

Tek anahtar: `ne-yesek:state`.

```json
{
  "schemaVersion": 1,
  "activePresetId": "hepsi",
  "hiddenFoodIds": ["ciger", "iskembe"]
}
```

## State Yönetimi

### In-memory state

```js
{
  activePresetId: 'hepsi',
  hiddenFoodIds: Set<string>,
  isSpinning: false,
  lastResult: null
}
```

`activePresetId` ve `hiddenFoodIds` localStorage'a senkronize edilir. `isSpinning` ve `lastResult` yalnızca runtime'da yaşar.

### Mutation API'si

```js
state.setActivePreset(presetId)
state.toggleHidden(foodId)
state.showAll()
state.getEffectiveFoods()       // saf hesap, her render'da çağrılabilir
state.onChange(callback)
```

`getEffectiveFoods()` mantığı:

```
foods → preset filtresi → hiddenFoodIds çıkar → kalan = aktif çark havuzu
```

### Init akışı

1. `state.js` localStorage'dan `ne-yesek:state` anahtarını okur.
2. Veri yoksa default state ile başlar.
3. JSON parse hatası: default'a fallback, eski veri silinir.
4. `schemaVersion` mevcut versiyondan küçükse migration çalışır (v1'de migration yok, altyapı ileride için).
5. `hiddenFoodIds` içindeki, artık `FOODS` listesinde olmayan ID'ler atılır.
6. `activePresetId` artık var olmayan bir preset ise `'hepsi'`'ye düşer.

### Yazma stratejisi

Her mutation sonrası anında localStorage'a yazılır. Yazma `try/catch` ile sarılı; quota dolarsa veya storage erişilemezse sessizce geçilir, runtime state çalışmaya devam eder.

## UI ve Etkileşim

### Ana ekran düzeni (yukarıdan aşağıya)

1. **Üst bar:** Sol başlık ("ne yesek?"), sağ köşede yönetim butonu (`≡`).
2. **Preset şeridi:** Yatay scroll edilebilen NES.css buton chip'leri. Aktif preset belirgin.
3. **Slot kutusu:** Ekran ortasında dikey makara, üst-alttaki yemekler hafif silik, ortadaki vurgu çerçevesi içinde.
4. **Bilgi alanı:** Tek satır metin, "Hepsi: 12 yemek aktif" gibi (aktif preset adı ve `getEffectiveFoods().length`).
5. **Çevir butonu:** Altta tam genişlik, NES `is-success` yeşil, "ÇEVİR" yazısı.

### Yönetim drawer'ı

- Alttan kayan modal panel.
- Üstte başlık ("Yemek Listesi") ve kapat (`×`).
- Sayaç: "Aktif: 12 / 42" (12 = `getEffectiveFoods().length`, 42 = `FOODS.length` toplam yemek; payda sabittir, preset değişince yalnızca pay değişir).
- Liste: her satırda emoji, yemek adı, NES checkbox.
- Aktif preset filtresi listede uygulanmaz; kullanıcı tüm yemekleri görür ve yönetebilir.
- En altta "Tümünü göster" butonu (gizlenenleri toplu geri açar).

### Etkileşim akışları

**Çark çevirme:**
1. Kullanıcı preset seçer (veya default "Hepsi" kalır).
2. "ÇEVİR" basılır.
3. Slot animasyonu başlar (yaklaşık 2.5 saniye).
4. Animasyon biter, ortada bir yemek kalır.
5. Buton "TEKRAR ÇEVİR" olur.

**Yemek gizleme:**
1. `≡` basılır, drawer açılır.
2. Yemek satırındaki checkbox toggle edilir.
3. Drawer kapatılınca yeni durum çarka yansır.

**Preset değiştirme:**
1. Preset chip'ine basılır.
2. Bilgi alanı, sayaç ve slot dekoratif önizleme anında güncellenir.

### Klavye ve erişilebilirlik

- "ÇEVİR" Space veya Enter ile tetiklenebilir.
- Drawer Escape ile kapanır.
- Tüm interaktif öğelerin focus state'i belirgindir.
- Slot sonucu için `role="status"` ve `aria-live="polite"`.

### Boş havuz durumu

Filtre ve gizlemeler sonucu hiç yemek kalmazsa: slot kutusunda "Aktif yemek yok. Listeden geri açmayı veya preset değiştirmeyi dene." mesajı, çevir butonu disabled.

## Slot Mekaniği

### Rastgelelik

`crypto.getRandomValues()` ile uniform rastgele indeks. Eğer `crypto` mevcut değilse `Math.random()` fallback. Aynı sonucun arka arkaya çıkması engellenmez (gerçek rastgelelik).

### Animasyon

CSS `transform: translateY()` + `transition` yaklaşımı:

1. Slot kutusu içinde dikey `<div class="reel">`.
2. Reel içine havuzdaki yemekler 3-5 kez tekrarlı yazılır.
3. JS hedef indeksi seçer, hedef y-offset'i hesaplar.
4. Reel'e `transition` uygulanır, `translateY(-targetY)` set edilir.
5. `transitionend` event'inde reel snap pozisyonuna getirilir, sonuç UI'a yazılır.
6. Watchdog: `setTimeout(spinDuration + 200)` ile event tetiklenmezse de state temizlenir.

### Parametreler

```js
const SLOT_CONFIG = {
  itemHeight: 60,
  visibleItems: 5,
  spinDurationMs: 2500,
  minSpins: 8,
  easing: 'cubic-bezier(0.15, 0.85, 0.3, 1)'
}
```

### Reduced motion

`prefers-reduced-motion: reduce` aktifse animasyon süresi 0'a iner, sonuç anında görünür, sonuç satırı kısa bir flash yapar.

### Performans

Reel'de yaklaşık 200 satır (40 yemek × 5 tekrar) tek seferde DOM'a yazılır. Animasyon CSS transform üzerinden GPU akselere, 60fps hedef.

## Hata Yönetimi

| Hata | Davranış |
|---|---|
| localStorage bozuk JSON | Parse hatası yakalanır, default state, eski veri silinir |
| localStorage yazma başarısız | Sessizce geç, runtime state çalışır |
| `crypto` yok | `Math.random()` fallback |
| NES.css CDN ulaşılamadı | Yerel `styles.css` minimal fallback styling sağlar |
| `transitionend` tetiklenmedi | Watchdog ile state temizlenir |

Genel ilke: hiçbir hata kullanıcıya teknik mesaj göstermez.

## Sınır Durumlar

1. Aktif yemek 0: bilgilendirme mesajı, çevir disabled.
2. Aktif yemek 1: animasyon yine oynar, sonuç o tek yemek.
3. Aktif yemek 2: aynı sonucun arka arkaya çıkması mümkün, beklenen.
4. Yemek listesi güncellendiğinde: localStorage'daki geçersiz ID'ler atılır.
5. Hızlı tekrar tıklama: `isSpinning` flag'i ile engellenir.
6. Drawer açıkken çevir: drawer modal davranır, etkileşim yok.
7. Çok küçük ekran (< 320px): dikey sıkışır ama kullanılır kalır.
8. Geniş ekran (desktop): slot kutusu maksimum 480px ortalanır, mobil görünümün büyütülmüş hali.

## Test Stratejisi

### Manuel test checklist'i

- Tüm preset'ler arasında geçiş, sayaç doğru.
- Yemek gizleme ve gösterme, çark havuzu güncel.
- localStorage temizleme sonrası state default'a dönüyor.
- iOS Safari ve Android Chrome'da animasyon akıcı.
- Reduced motion modunda animasyon devre dışı.
- Klavye navigasyonu (Tab, Enter, Space, Escape).
- Sayfa yüklendikten sonra ağ koparılınca çalışıyor.

### Otomatik test (opsiyonel)

`state.js` ve `data.js` içindeki saf fonksiyonlar (filtreleme, gizleme, preset eşleme) için Vitest veya Node `node:test` ile birim testler. DOM ve animasyon testi yok.

## Tarayıcı Desteği

- Hedef: son 2 sürüm Chrome, Firefox, Safari, Edge (mobil dahil).
- ES2020+ özellikleri kullanılır, transpile yok, polyfill yok.

## Lisans

Repo'da LICENSE dosyası yok (kullanıcının açık tercihi).

## Açık Sorular

- Yerel klasör adı `yemek-bulucu`, repo adı `ne-yesek`. Klasör implementasyon başlamadan önce yeniden adlandırılmalı mı?
- Başlangıç yemek listesinin tam içeriği (yaklaşık 30-50 yemek) implementasyon planı sırasında sonlandırılacak.
