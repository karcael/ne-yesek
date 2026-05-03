# ne yesek?

"Bugün ne yesek?" sorusuna saniyeler içinde cevap veren statik bir slot makinesi web uygulaması.

## Kullanım

`index.html` dosyasını tarayıcıda aç. İnternet bağlantısı yalnızca ilk açılışta NES.css ve fontu indirmek için gerekli.

## Geliştirme

```bash
# Birim testleri
npm test
```

Build adımı yok, paket bağımlılığı yok. Tüm modüller native ES modülleri.

## Teknoloji

- HTML, CSS, vanilla JavaScript (ES2020+)
- NES.css (CDN)
- Press Start 2P (Google Fonts)
- localStorage (kullanıcı tercihleri)
- Node 20+ (sadece test için)

## Mimarisi

`architecture.md` dosyasına bakın.

## Tasarım dokümanı

`docs/superpowers/specs/2026-05-03-ne-yesek-design.md` dosyasında tüm tasarım kararları.
