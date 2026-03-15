# Site Analizi ve Geliştirme Önerileri

Bu doküman, mevcut web sitesinin (`index.html`) ve sohbet API endpoint’inin (`api/chat. js`) hızlı bir teknik/ürün değerlendirmesidir.

## 1) Kısa Özet

Site, tek sayfalık (landing page) bir fizyoterapi tanıtım sitesi olarak güçlü bir görsel sunum ve net iletişim CTA’larına sahip. Ancak üretim ortamında güvenilirlik, güvenlik, SEO ve erişilebilirlik taraflarında iyileştirme alanları var.

## 2) Güçlü Yönler

- **Net değer önerisi ve konumlandırma:** Hero alanında hizmet kapsamı ve şehir bilgisi anlaşılır.
- **Güçlü iletişim kanalları:** WhatsApp, telefon, Instagram ve harita bağlantıları görünür.
- **Modern görsel dil:** Tailwind tabanlı temiz tasarım, mobil uyumlu yapı ve dikkat çekici chat tetikleyici.
- **Temel chatbot entegrasyonu:** Kullanıcıdan metin alıp backend üzerinden yanıt dönen akış mevcut.

## 3) Kritik Eksikler (Öncelik: Yüksek)

### 3.1 Chat endpoint dosya adı/routing riski
- `api/chat. js` dosya adında **nokta ile uzantı arasında boşluk** var. Bu, Vercel route eşleşmesinde sorun çıkarabilir.
- Frontend tarafı `/api/chat` endpoint’ine çağrı yapıyor; route gerçekten bu dosyaya düşmeyebilir.

**Öneri:** Dosya adını `api/chat.js` yapın.

### 3.2 XSS riski (chat mesajları)
- Chat mesajları `innerHTML` ile basılıyor.
- Kullanıcı girdisi veya model çıktısı HTML/script benzeri içerik döndürürse XSS vektörü oluşabilir.

**Öneri:** `textContent` ile güvenli render yapın veya sanitize (DOMPurify vb.) kullanın.

### 3.3 Backend hata yönetimi yetersiz
- `GEMINI_API_KEY` yoksa veya upstream API hata dönerse kontrollü hata yönetimi sınırlı.
- Şu an doğrudan `response.json()` ve 200 dönüş var; API başarısız olsa bile beklenmedik davranış oluşabilir.

**Öneri:**
- API key kontrolü ve 500/503 gibi net durum kodları döndürme,
- `try/catch` ile güvenli hata yakalama,
- Rate limiting ve abuse önleme.

### 3.4 Güvenlik başlıkları / dış link güvenliği
- `target="_blank"` kullanılan linklerde `rel="noopener noreferrer"` yok.
- Bu, tabnabbing riskini artırabilir.

**Öneri:** Dış linklerin tümüne `rel="noopener noreferrer"` ekleyin.

## 4) Önemli İyileştirmeler (Öncelik: Orta)

### 4.1 SEO ve Local SEO
- Open Graph/Twitter kart etiketleri yok.
- Canonical URL yok.
- LocalBusiness/MedicalClinic schema (JSON-LD) yok.

**Öneri:**
- `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`,
- `link rel="canonical"`,
- `Physiotherapy`/`MedicalClinic` yapılandırılmış veri ekleyin.

### 4.2 Erişilebilirlik (A11y)
- Chat aç/kapa butonları için anlamlı `aria-label` metinleri yok.
- Mobil menü butonu var ancak açılır menü davranışı görünmüyor (yalnızca buton mevcut).
- Klavye ve ekran okuyucu deneyimi daha güçlü hale getirilebilir.

**Öneri:**
- `aria-label`, `aria-expanded`, `aria-controls` ekleyin,
- odak (focus) stilleri iyileştirin,
- form alanlarında yardımcı metin ve hata mesajları tanımlayın.

### 4.3 Performans
- Tailwind CDN runtime üretim için ideal değil (ilk yükleme + deterministik build açısından).
- Hero görseli dış kaynaktan geliyor; optimizasyon ve cache kontrol sınırlı.

**Öneri:**
- Build-time Tailwind (CLI/Vite) + purge,
- görsel optimizasyon (WebP/AVIF, responsive `srcset`, lazy-load uygun yerlerde),
- kritik CSS/asset stratejisi.

## 5) Ürün/İş Hedefi Geliştirmeleri (Öncelik: Orta-Düşük)

- **Randevu dönüşüm hunisi:** “Randevu Al” CTA için tekil bir randevu formu veya WhatsApp ön-doldurulmuş mesaj akışı.
- **Sosyal kanıt:** Hasta yorumları, başarı hikayeleri, sertifikalar, önce/sonra (etik sınırlar içinde) içerikleri.
- **Güven unsurları:** Sık sorulan sorular (SSS), hangi durumlarda başvurulmalı, seans süreci.
- **KVKK/aydınlatma metni:** Özellikle chat verisi için açık aydınlatma ve açık rıza metni.

## 6) Hızlı Kazanımlar (1–2 gün)

1. `api/chat. js` -> `api/chat.js` yeniden adlandırma.
2. Dış linklere `rel="noopener noreferrer"` ekleme.
3. Chat render’da `innerHTML` yerine güvenli metin basma.
4. API key yok/hata durumları için backend’de net status code + kullanıcı dostu mesaj.
5. OG + canonical + temel schema ekleme.

## 7) Yol Haritası (2–4 hafta)

- **Hafta 1:** Güvenlik/kararlılık düzeltmeleri + hataların izlenmesi (logs).
- **Hafta 2:** SEO + Local SEO + içerik genişletme.
- **Hafta 3:** Randevu dönüşüm akışı, A/B testli CTA metinleri.
- **Hafta 4:** Performans optimizasyonu ve erişilebilirlik denetimi (Lighthouse + axe).

## 8) Nasıl Test Edebiliriz?

Bu proje tek sayfa + serverless API yapısında olduğu için, testleri 4 katmanda yapmak en sağlıklısı:

### 8.1 Hızlı statik kontroller (1–2 dk)

- Route çağrısını kontrol edin: Frontend gerçekten `/api/chat` çağırıyor mu?
- Riskli render noktası var mı kontrol edin (`innerHTML`).
- Dış linklerde `target="_blank"` kullanımı ve `rel` eksikleri tarayın.

Örnek komutlar:

```bash
rg "fetch\('/api/chat'" index.html
rg "innerHTML" index.html
rg 'target="_blank"' index.html
```

### 8.2 Lokal çalıştırma (UI smoke test)

Statik sayfayı hızlı açmak için:

```bash
python3 -m http.server 8080
```

Tarayıcıdan `http://localhost:8080` açıp şu kontrolleri yapın:

1. Hero, navbar, hizmet kartları ve iletişim alanı doğru render oluyor mu?
2. Mobil görünümde (DevTools) chat butonu görünür ve aç/kapa çalışıyor mu?
3. WhatsApp, telefon ve harita linkleri doğru hedefe gidiyor mu?

> Not: Bu yöntem yalnızca frontend smoke test içindir; `/api/chat` endpoint’i için serverless runtime gerekir.

### 8.3 API testi (serverless fonksiyon)

Vercel dev ortamında endpoint test edin:

```bash
vercel dev
curl -i -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Merhaba"}'
```

Beklenenler:
- `200 OK` + JSON `reply` alanı,
- API key yoksa kontrollü hata mesajı,
- Geçersiz method için `405`.

### 8.4 Yayın öncesi kalite kapısı (önerilen)

- **Lighthouse:** Performance, SEO, Accessibility metrikleri.
- **Axe DevTools:** erişilebilirlik ihlallerini yakalama.
- **Security quick check:** XSS yüzeyi, dış link güvenliği, env key yönetimi.

Minimum kabul kriteri (öneri):
- Lighthouse SEO >= 90,
- Lighthouse Accessibility >= 90,
- Chat aç/kapa + mesaj gönderim akışı hatasız,
- İletişim CTA’larında kırık link olmaması.

---

İsterseniz bir sonraki adımda bu maddeleri doğrudan kodlayıp, **öncelikli 5 iyileştirmeyi** tek PR içinde uygulayabilirim.
