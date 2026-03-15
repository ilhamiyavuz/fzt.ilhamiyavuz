# Türkçe AI Destekli Fizyoterapi Platformu (MVP)

Bu repo 3 ana bileşeni içerir:
- `backend/`: FastAPI + PostgreSQL + MediaPipe analiz API
- `web/`: Next.js fizyoterapist paneli
- `mobile/`: React Native (Expo) hasta uygulaması

## 1) Hızlı Başlangıç (Docker)

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp web/.env.example web/.env.local
cp mobile/.env.example mobile/.env

docker compose up -d db backend

docker compose run --rm backend_migrate_seed

docker compose up -d web mobile
```

Servisler:
- Backend: `http://localhost:8000`
- Backend Swagger: `http://localhost:8000/docs`
- Web panel: `http://localhost:3000`
- Mobil (Expo web): `http://localhost:19006`

## 2) Lokal Geliştirme

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python -m scripts.seed_demo
uvicorn app.main:app --reload
```

### Web
```bash
cd web
cp .env.example .env.local
npm install
npm run dev
```

### Mobile
```bash
cd mobile
cp .env.example .env
npm install
npm run start
```

## 3) AI Analiz Entegrasyonu

Aşağıdaki endpointler backend içinde aktiftir:
- `POST /api/v1/ai-analysis/session-frame` (landmark bazlı)
- `POST /api/v1/ai-analysis/session-image` (base64 görüntü bazlı MediaPipe çıkarımı)

Desteklenen egzersiz türleri:
- `squat`
- `knee_flexion`
- `shoulder_abduction`

## 4) Demo Kullanıcılar

Seed sonrası:
- Fizyoterapist: `fzt.demo@platform.local` / `Demo1234!`
- Hasta: `hasta.demo@platform.local` / `Demo1234!`

## 5) Migration ve Seed Komutları

```bash
cd backend
alembic revision --autogenerate -m "yeni_migration"
alembic upgrade head
python -m scripts.seed_demo
```

## 6) Bilinen Sınırlamalar
- Mobil ve web için bu repoda temel arayüz iskeleti vardır; ileri seviye iş akışları sonraki fazdadır.
- Canlı kamera akışından frame toplama mobil tarafta örneklenmiş, üretim entegrasyonu ayrı sprint gerektirir.
- AI analizde ilk sürümde sol taraf landmark’ları baz alınır.


## 7) Yeni API Bağlantıları
- `GET /api/v1/auth/me`
- `GET /api/v1/physiotherapists/me/dashboard`
- `GET /api/v1/patients/me/today-plan`
- `POST /api/v1/ai-analysis/session-image`

## 8) Demo Senaryosu ve API Örnekleri
- Uçtan uca demo akışı: `docs/demo_senaryosu.md`
- Hazır HTTP istekleri: `docs/demo_api_istekleri.http`


## 9) İstenen Terminal Akışı (Birebir)

```bash
# 1) projeye gir
cd proje-klasoru

# 2) backend
cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

```bash
# 3) yeni terminal aç, web panel
cd web
cp .env.example .env
npm install
npm run dev
```

```bash
# 4) yeni terminal aç, mobil
cd mobile
cp .env.example .env
npm install
npx expo start
```
