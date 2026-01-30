from sqlalchemy.orm import Session
from typing import Optional

from models import WC
from schemas.wc import WCCreate

def create_wc(db: Session, wc_in: WCCreate) -> WC:
    wc = WC(**wc_in.model_dump())
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc

def get_wcs(
    db: Session,
    accessible: Optional[bool] = None,
    gender_neutral: Optional[bool] = None,
    has_changing_table: Optional[bool] = None,
    only_for_customers: Optional[bool] = None,
    has_intimate_hygiene_products: Optional[bool] = None,
) -> list[WC]:
    query = db.query(WC)

    if accessible is not None:
        query = query.filter(WC.accessible == accessible)

    if gender_neutral is not None:
        query = query.filter(WC.gender_neutral == gender_neutral)

    if has_changing_table is not None:
        query = query.filter(WC.has_changing_table == has_changing_table)

    if only_for_customers is not None:
        query = query.filter(WC.only_for_customers == only_for_customers)

    if has_intimate_hygiene_products is not None:
        query = query.filter(
            WC.has_intimate_hygiene_products == has_intimate_hygiene_products
        )

    return query.all()


def get_wc_by_id(db: Session, wc_id: int) -> WC | None:
    return db.get(WC, wc_id)
