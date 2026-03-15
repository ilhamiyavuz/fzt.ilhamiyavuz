.PHONY: backend-install backend-run backend-migrate backend-seed web-run mobile-run

backend-install:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt

backend-run:
	cd backend && . .venv/bin/activate && uvicorn app.main:app --reload

backend-migrate:
	cd backend && . .venv/bin/activate && alembic upgrade head

backend-seed:
	cd backend && . .venv/bin/activate && python -m scripts.seed_demo

web-run:
	cd web && npm install && npm run dev

mobile-run:
	cd mobile && npm install && npm run start
