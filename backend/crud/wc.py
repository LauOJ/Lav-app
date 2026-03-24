from sqlalchemy.orm import Session
from sqlalchemy import case, func
from typing import Optional

from models import WC, Review
from schemas.wc import WCCreate, WCUpdate


def _bool_avg_percentage(column):
    # Keep NULL when there are no joined reviews, return 0/1 for real rows.
    return (
        func.avg(
            case(
                (Review.id.is_(None), None),
                (column.is_(True), 1.0),
                else_=0.0,
            )
        )
        * 100
    )

def create_wc(db: Session, wc_in: WCCreate) -> WC:
    wc = WC(**wc_in.model_dump())
    db.add(wc)
    db.commit()
    db.refresh(wc)
    return wc


def _attach_review_stats(
    wc: WC,
    avg_cleanliness: float | None,
    reviews_count: int,
    safety_score: float | None,
    accessibility_score: float | None,
    toilet_paper_score: float | None,
) -> WC:
    wc.avg_cleanliness = avg_cleanliness
    wc.reviews_count = reviews_count
    wc.safety_score = safety_score
    wc.accessibility_score = accessibility_score
    wc.toilet_paper_score = toilet_paper_score
    return wc

def get_wcs(
    db: Session,
    is_public: Optional[bool] = None,
    has_changing_table: Optional[bool] = None,
) -> list[WC]:
    query = db.query(WC)

    if is_public is not None:
        query = query.filter(WC.is_public == is_public)

    if has_changing_table is not None:
        query = query.filter(WC.has_changing_table == has_changing_table)

    query = (
        query.outerjoin(Review, Review.wc_id == WC.id)
        .group_by(WC.id)
        .with_entities(
            WC,
            func.avg(Review.cleanliness_rating).label("avg_cleanliness"),
            func.count(Review.id).label("reviews_count"),
            _bool_avg_percentage(Review.felt_safe).label("safety_score"),
            _bool_avg_percentage(Review.accessible).label("accessibility_score"),
            _bool_avg_percentage(Review.has_toilet_paper).label("toilet_paper_score"),
        )
    )

    rows = query.all()
    return [
        _attach_review_stats(
            wc,
            avg_cleanliness,
            reviews_count,
            safety_score,
            accessibility_score,
            toilet_paper_score,
        )
        for (
            wc,
            avg_cleanliness,
            reviews_count,
            safety_score,
            accessibility_score,
            toilet_paper_score,
        ) in rows
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
            func.count(Review.id).label("reviews_count"),
            _bool_avg_percentage(Review.felt_safe).label("safety_score"),
            _bool_avg_percentage(Review.accessible).label("accessibility_score"),
            _bool_avg_percentage(Review.has_toilet_paper).label("toilet_paper_score"),
        )
        .first()
    )

    if not row:
        return None

    (
        wc,
        avg_cleanliness,
        reviews_count,
        safety_score,
        accessibility_score,
        toilet_paper_score,
    ) = row
    return _attach_review_stats(
        wc,
        avg_cleanliness,
        reviews_count,
        safety_score,
        accessibility_score,
        toilet_paper_score,
    )


def update_wc(db: Session, wc_id: int, wc_in: WCUpdate) -> WC | None:
    wc = db.get(WC, wc_id)
    if not wc:
        return None

    data = wc_in.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(wc, key, value)

    db.add(wc)
    db.commit()
    db.refresh(wc)
    return get_wc_by_id(db, wc_id)
