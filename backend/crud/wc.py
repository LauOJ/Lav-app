from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from models import WC, Review
from schemas.wc import WCCreate

def create_wc(db: Session, wc_in: WCCreate) -> WC:
    wc = WC(**wc_in.model_dump())
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc


def _attach_review_stats(
    wc: WC,
    avg_cleanliness: float | None,
    avg_safety: float | None,
    reviews_count: int,
) -> WC:
    wc.avg_cleanliness = avg_cleanliness
    wc.avg_safety = avg_safety
    wc.reviews_count = reviews_count
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

    query = (
        query.outerjoin(Review, Review.wc_id == WC.id)
        .group_by(WC.id)
        .with_entities(
            WC,
            func.avg(Review.cleanliness_rating).label("avg_cleanliness"),
            func.avg(Review.safety_rating).label("avg_safety"),
            func.count(Review.id).label("reviews_count"),
        )
    )

    rows = query.all()
    return [
        _attach_review_stats(wc, avg_cleanliness, avg_safety, reviews_count)
        for wc, avg_cleanliness, avg_safety, reviews_count in rows
    ]


def get_wc_by_id(db: Session, wc_id: int) -> WC | None:
    row = (
        db.query(WC)
        .outerjoin(Review, Review.wc_id == WC.id)
        .filter(WC.id == wc_id)
        .group_by(WC.id)
        .with_entities(
            WC,
            func.avg(Review.cleanliness_rating).label("avg_cleanliness"),
            func.avg(Review.safety_rating).label("avg_safety"),
            func.count(Review.id).label("reviews_count"),
        )
        .first()
    )

    if not row:
        return None

    wc, avg_cleanliness, avg_safety, reviews_count = row
    return _attach_review_stats(wc, avg_cleanliness, avg_safety, reviews_count)
