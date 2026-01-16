from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database import get_db
from schemas.wc import WCCreate, WCRead
from crud.wc import create_wc as create_wc_crud, get_wcs

from security import get_current_user
from models import User


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
