# ne yesek?

"Bugün ne yesek?" sorusuna saniyeler içinde cevap veren statik bir slot makinesi web uygulaması.

## Kullanım

Yayında: dosyaları herhangi bir statik web sunucusuna (GitHub Pages, nginx, Vercel, Cloudflare Pages vb.) koyman yeterli. İnternet bağlantısı yalnızca ilk açılışta NES.css ve fontu indirmek için gerekli.

## Geliştirme

Proje native ES modülleri kullanıyor. Modern tarayıcılar bu modülleri `file://` üzerinden CORS nedeniyle yüklemiyor, bu yüzden yerel test için bir HTTP sunucu gerekli. En kolayı:

```bash
# Python (genelde sistemde yüklü)
python3 -m http.server 8765
# Sonra: http://localhost:8765/

# Veya Node ile
npx serve

# Veya VS Code "Live Server" eklentisi
```

Birim testleri için:

```bash
npm test
```

Build adımı yok, paket bağımlılığı yok.

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
