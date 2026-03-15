# Uçtan Uca Çalışan Demo Senaryosu (Türkçe)

Bu senaryo aşağıdaki akışı canlı demoda doğrulamak içindir:
1. Fizyoterapist giriş
2. Yeni hasta ekleme
3. Hastaya diz fleksiyon programı atama
4. Hasta mobil giriş
5. Bugünkü egzersizleri görme
6. Kamera ile egzersiz başlatma
7. AI tekrar sayımı ve Türkçe geri bildirim
8. Ağrı günlüğü girişi
9. Fizyoterapist panelde takip verilerini görme

## Demo kullanıcıları (seed)
- Fizyoterapist: `fzt.demo@platform.local` / `Demo1234!`
- Hasta: `hasta.demo@platform.local` / `Demo1234!`

## Seed ile gelen örnekler
- Egzersizler:
  - Diz Fleksiyon
  - Squat
- Aktif program:
  - Diz Rehabilitasyon Demo Programı
- Örnek seans:
  - completion_rate: `80`
  - ai_score_avg: `84`
- Örnek ağrı günlüğü:
  - pain_level: `4`

## API akışı (özet)

### 1) Fizyoterapist login
`POST /api/v1/auth/login`

### 2) Yeni hasta ekle
`POST /api/v1/patients`

### 3) Diz fleksiyon programı ata
`POST /api/v1/exercises/programs`

### 4) Hasta login
`POST /api/v1/auth/login`

### 5) Hasta bugünkü planı görsün
`GET /api/v1/patients/me/today-plan`

### 6) Hasta egzersiz seansı başlatsın
`POST /api/v1/exercises/sessions/start`

### 7) AI tekrar + geri bildirim
- Landmark bazlı: `POST /api/v1/ai-analysis/session-frame`
- Görüntü bazlı: `POST /api/v1/ai-analysis/session-image`

### 8) Ağrı günlüğü gir
`POST /api/v1/pain-logs`

### 9) Fizyoterapist takip ekranı
- `GET /api/v1/physiotherapists/me/dashboard`
- `GET /api/v1/physiotherapists/patients/{patient_id}/follow-up`
- `GET /api/v1/pain-logs/patient/{patient_id}`

> Tam örnek request/response için `docs/demo_api_istekleri.http` dosyasını kullanın.
