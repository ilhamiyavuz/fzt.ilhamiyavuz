# FastAPI Backend (MVP)

Türkçe AI destekli fizyoterapi platformunun backend servisidir.

## Özellikler
- FastAPI + SQLAlchemy + Alembic + PostgreSQL
- JWT tabanlı kimlik doğrulama (access/refresh)
- Rol bazlı yetkilendirme
- MediaPipe tabanlı hareket analizi (squat, diz fleksiyon, omuz abdüksiyon)

## Kurulum
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python seed.py
uvicorn app.main:app --reload
```

## Migration
```bash
alembic upgrade head
alembic revision --autogenerate -m "aciklama"
```

## Demo Login
- Fizyoterapist: `fzt.demo@platform.local` / `Demo1234!`
- Hasta: `hasta.demo@platform.local` / `Demo1234!`

## AI Endpointleri
- `POST /api/v1/ai-analysis/session-frame`
- `POST /api/v1/ai-analysis/session-image`

> Sistem tanı koymaz; fizyoterapiste yardımcı karar destek amaçlıdır.


Alternatif: `python -m scripts.seed_demo`
