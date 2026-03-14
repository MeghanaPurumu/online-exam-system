from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app import database
from app.config import get_settings
from app.models.user import User
from app.repositories import user_repository
from app.schemas.user import UserCreate, UserOut, UserAdminOut
from app.schemas.exam import ProfileStats
from app.services import auth_service, exam_service
from app.utils.security import decode_access_token


router = APIRouter()

# Swagger/OpenAPI expects tokenUrl to be relative to the API root.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
settings = get_settings()


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(database.get_db)):
    user = auth_service.register_user(db, payload)
    return user


@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    access_token = auth_service.login_user(db, email=form_data.username, password=form_data.password)
    return {"access_token": access_token, "token_type": "bearer"}


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except (JWTError, ValueError):
        raise credentials_exception

    user = user_repository.get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User account is blocked")
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.get("/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserAdminOut])
def list_users(
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    return db.query(User).order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/block", response_model=UserAdminOut)
def block_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = False
    db.commit()
    db.refresh(user)
    return user


@router.patch("/users/{user_id}/unblock", response_model=UserAdminOut)
def unblock_user(
    user_id: int,
    db: Session = Depends(database.get_db),
    current_admin: User = Depends(get_current_admin),
):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    db.refresh(user)
    return user


@router.get("/me/profile", response_model=ProfileStats)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(database.get_db),
):
    return exam_service.get_profile_stats(db, student_id=current_user.id)

