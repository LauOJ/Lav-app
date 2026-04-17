from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from schemas.user import UserCreate, UserRead, UserLanguageUpdate, UserUpdate, UserPasswordChange
from schemas.review import ReviewRead
from schemas.wc import WCRead
from crud.user import create_user
from crud.favorite import get_user_favorites
from crud.wc import get_wc_by_id

from security import hash_password, verify_password, get_current_user
from limiter import limiter
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
@limiter.limit("10/minute")
def create_user_endpoint(
    request: Request,
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


@router.patch(
    "/me",
    response_model=UserRead,
)
def update_me_endpoint(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if user_in.name is not None:
        current_user.name = user_in.name.strip() or None
    if user_in.email is not None and user_in.email != current_user.email:
        existing = db.query(User).filter(User.email == user_in.email).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use",
            )
        current_user.email = user_in.email
    db.commit()
    db.refresh(current_user)
    return current_user


@router.patch(
    "/me/password",
    status_code=status.HTTP_204_NO_CONTENT,
)
@limiter.limit("5/hour")
def change_password_endpoint(
    request: Request,
    pwd_in: UserPasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(pwd_in.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    current_user.password_hash = hash_password(pwd_in.new_password)
    db.commit()


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_me_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.delete(current_user)
    db.commit()


@router.patch(
    "/me/language",
    response_model=UserRead,
)
def update_language_endpoint(
    lang_in: UserLanguageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    allowed = {'ca', 'es'}
    if lang_in.language_preference not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid language. Allowed values: ca, es",
        )
    current_user.language_preference = lang_in.language_preference
    db.commit()
    db.refresh(current_user)
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


@router.get(
    "/me/favorites",
    response_model=list[WCRead],
)
def list_my_favorites_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    favorites = get_user_favorites(db, current_user.id)
    wcs = []
    for f in favorites:
        wc = get_wc_by_id(db, f.wc_id)
        if wc is not None:
            wcs.append(wc)
    return wcs
