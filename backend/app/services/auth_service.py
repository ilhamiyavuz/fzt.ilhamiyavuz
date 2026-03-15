from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest


class AuthService:
    @staticmethod
    def register(db: Session, payload: RegisterRequest) -> User:
        conditions = [User.email == payload.email]
        if payload.phone:
            conditions.append(User.phone == payload.phone)

        existing = db.query(User).filter(or_(*conditions)).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu e-posta veya telefon ile kayıtlı bir kullanıcı zaten var",
            )

        user = User(
            email=payload.email,
            phone=payload.phone,
            password_hash=get_password_hash(payload.password),
            role=payload.role,
            is_active=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, payload: LoginRequest) -> dict[str, str]:
        user = (
            db.query(User)
            .filter(or_(User.email == payload.email_or_phone, User.phone == payload.email_or_phone))
            .first()
        )

        if not user or not verify_password(payload.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Hatalı giriş bilgileri")

        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_423_LOCKED, detail="Hesap pasif durumda")

        user.updated_at = datetime.now(UTC)
        db.add(user)
        db.commit()

        return {
            "access_token": create_access_token(str(user.id)),
            "refresh_token": create_refresh_token(str(user.id)),
        }
