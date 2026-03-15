import uuid

from pydantic import EmailStr

from app.models.user import UserRole
from app.schemas.common import ORMBase


class UserResponse(ORMBase):
    id: uuid.UUID
    email: EmailStr
    phone: str | None
    role: UserRole
    is_active: bool
