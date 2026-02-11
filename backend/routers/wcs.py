from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db
from schemas.wc import WCCreate, WCCreated, WCRead, WCUpdate
from schemas.review import ReviewRead
from crud.wc import create_wc as create_wc_crud, get_wcs, get_wc_by_id, update_wc
from crud.review import get_reviews_by_wc_id
from crud.favorite import add_favorite, remove_favorite

from security import get_current_user
from models import User, WC


router = APIRouter(
    prefix="/wcs",
    tags=["wcs"],
)

@router.post(
    "",
    response_model=WCCreated,
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
    accessible: Optional[bool] = Query(None),
    gender_neutral: Optional[bool] = Query(None),
    has_changing_table: Optional[bool] = Query(None),
    only_for_customers: Optional[bool] = Query(None),
    has_intimate_hygiene_products: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    return get_wcs(
        db=db,
        accessible=accessible,
        gender_neutral=gender_neutral,
        has_changing_table=has_changing_table,
        only_for_customers=only_for_customers,
        has_intimate_hygiene_products=has_intimate_hygiene_products,
    )



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


@router.patch(
    "/{wc_id}",
    response_model=WCRead,
)
def update_wc_endpoint(
    wc_id: int,
    wc_in: WCUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    wc = update_wc(db, wc_id, wc_in)
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


@router.post(
    "/{wc_id}/favorite",
    status_code=status.HTTP_201_CREATED,
)
def add_favorite_endpoint(
    wc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if get_wc_by_id(db, wc_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WC not found",
        )
    favorite = add_favorite(db, current_user.id, wc_id)
    if favorite is None:
        return JSONResponse(
            content={"detail": "Already in favorites"},
            status_code=status.HTTP_200_OK,
        )
    return {"detail": "Added to favorites"}


@router.delete(
    "/{wc_id}/favorite",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_favorite_endpoint(
    wc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    removed = remove_favorite(db, current_user.id, wc_id)
    if not removed:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Favorite not found",
        )
