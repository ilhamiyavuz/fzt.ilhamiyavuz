"""Geliştirme ortamında tabloları hızlıca oluşturmak için yardımcı script."""

from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    init_db()
    print("Tablolar başarıyla oluşturuldu.")
