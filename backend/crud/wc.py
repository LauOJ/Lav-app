from sqlalchemy.orm import Session

from models import WC
from schemas.wc import WCCreate

def create_wc(db: Session, wc_in: WCCreate) -> WC:
    wc = WC(**wc_in.model_dump())
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc

def get_wcs(db: Session) -> list[WC]:
    return db.query(WC).all()


def get_wc_by_id(db: Session, wc_id: int) -> WC | None:
    return db.get(WC, wc_id)
