from datetime import timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories import user_repository
from app.schemas.user import UserCreate
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import get_settings


settings = get_settings()


def register_user(db: Session, payload: UserCreate, is_admin: bool = False):
    existing = user_repository.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    hashed_password = get_password_hash(payload.password)
    user = user_repository.create_user(
        db,
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hashed_password,
        is_admin=is_admin,
    )
    return user


def authenticate_user(db: Session, email: str, password: str):
    user = user_repository.get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        # User exists but has been blocked by an admin.
        # Return a clear, user-facing error message.
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="you're blocked by admin",
        )
    return user


def login_user(db: Session, email: str, password: str) -> str:
    user = authenticate_user(db, email, password)
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    token = create_access_token(
        data={"sub": str(user.id), "is_admin": user.is_admin},
        expires_delta=access_token_expires,
    )
    return token

