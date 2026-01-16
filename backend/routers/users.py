from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from schemas.user import UserCreate, UserRead
from schemas.review import ReviewRead
from crud.user import create_user

from security import hash_password, get_current_user
from crud.review import get_reviews_by_user_id
from models import User

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
)
def create_user_endpoint(
    user_in: UserCreate,
    db: Session = Depends(get_db),
):
    password_hash = hash_password(user_in.password)


    try:
        user = create_user(db, user_in, password_hash)
        return user
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )


@router.get(
    "/me",
    response_model=UserRead,
)
def get_me_endpoint(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.get(
    "/me/reviews",
    response_model=list[ReviewRead],
)
def list_my_reviews_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_reviews_by_user_id(db, current_user.id)
