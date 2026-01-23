from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.wc import WCCreate, WCRead
from schemas.review import ReviewRead
from crud.wc import create_wc as create_wc_crud, get_wcs, get_wc_by_id
from crud.review import get_reviews_by_wc_id

from security import get_current_user
from models import User, WC


router = APIRouter(
    prefix="/wcs",
    tags=["wcs"],
)

@router.post(
    "",
    response_model=WCRead,
    status_code=status.HTTP_201_CREATED,
)
def create_wc_endpoint(
    wc_in: WCCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wc = create_wc_crud(db, wc_in)
    return wc


@router.get(
    "",
    response_model=list[WCRead],
)
def list_wcs_endpoint(
    db: Session = Depends(get_db),
):
    return get_wcs(db)


@router.get(
    "/{wc_id}",
    response_model=WCRead,
)
def get_wc_endpoint(
    wc_id: int,
    db: Session = Depends(get_db),
):
    wc = get_wc_by_id(db, wc_id)
    if not wc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WC not found",
        )
    return wc


@router.get(
    "/{wc_id}/reviews",
    response_model=list[ReviewRead],
)
def list_wc_reviews_endpoint(
    wc_id: int,
    db: Session = Depends(get_db),
):
    wc = db.get(WC, wc_id)
    if not wc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WC not found",
        )
    return get_reviews_by_wc_id(db, wc_id)
