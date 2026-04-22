from sqlalchemy.orm import Session
from sqlalchemy import case, func
from typing import Optional

from models import WC, Review
from schemas.wc import WCCreate, WCUpdate


def _bool_avg_percentage(column):
    # NULL when no reviews at all; skip per-row NULLs (prefer-not-to-say) so
    # they don't count as "No" — SQL avg() ignores NULLs automatically.
    return (
        func.avg(
            case(
                (Review.id.is_(None), None),
                (column.is_(None), None),
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
    hygiene_products_score: float | None,
    free_entry_score: float | None,
    gender_mixed_score: float | None,
    changing_table_score: float | None,
    step_free_score: float | None,
    wide_door_score: float | None,
    turning_space_score: float | None,
    grab_bars_score: float | None,
    menstrual_cup_score: float | None,
) -> WC:
    wc.avg_cleanliness = avg_cleanliness
    wc.reviews_count = reviews_count
    wc.safety_score = safety_score
    wc.accessibility_score = accessibility_score
    wc.toilet_paper_score = toilet_paper_score
    wc.hygiene_products_score = hygiene_products_score
    wc.free_entry_score = free_entry_score
    wc.gender_mixed_score = gender_mixed_score
    wc.changing_table_score = changing_table_score
    wc.step_free_score = step_free_score
    wc.wide_door_score = wide_door_score
    wc.turning_space_score = turning_space_score
    wc.grab_bars_score = grab_bars_score
    wc.menstrual_cup_score = menstrual_cup_score
    return wc

def get_wcs(
    db: Session,
    is_public: Optional[bool] = None,
    min_lat: Optional[float] = None,
    max_lat: Optional[float] = None,
    min_lng: Optional[float] = None,
    max_lng: Optional[float] = None,
) -> list[WC]:
    query = db.query(WC).filter(WC.is_active == True)

    if is_public is not None:
        query = query.filter(WC.is_public == is_public)
    if min_lat is not None:
        query = query.filter(WC.latitude >= min_lat)
    if max_lat is not None:
        query = query.filter(WC.latitude <= max_lat)
    if min_lng is not None:
        query = query.filter(WC.longitude >= min_lng)
    if max_lng is not None:
        query = query.filter(WC.longitude <= max_lng)

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
            _bool_avg_percentage(Review.hygiene_products_available).label("hygiene_products_score"),
            _bool_avg_percentage(Review.could_enter_without_buying).label("free_entry_score"),
            _bool_avg_percentage(Review.has_gender_mixed_option).label("gender_mixed_score"),
            _bool_avg_percentage(Review.has_changing_table).label("changing_table_score"),
            _bool_avg_percentage(Review.step_free_access).label("step_free_score"),
            _bool_avg_percentage(Review.wide_door).label("wide_door_score"),
            _bool_avg_percentage(Review.turning_space).label("turning_space_score"),
            _bool_avg_percentage(Review.has_grab_bars).label("grab_bars_score"),
            _bool_avg_percentage(Review.menstrual_cup_suitable).label("menstrual_cup_score"),
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
            hygiene_products_score,
            free_entry_score,
            gender_mixed_score,
            changing_table_score,
            step_free_score,
            wide_door_score,
            turning_space_score,
            grab_bars_score,
            menstrual_cup_score,
        )
        for (
            wc,
            avg_cleanliness,
            reviews_count,
            safety_score,
            accessibility_score,
            toilet_paper_score,
            hygiene_products_score,
            free_entry_score,
            gender_mixed_score,
            changing_table_score,
            step_free_score,
            wide_door_score,
            turning_space_score,
            grab_bars_score,
            menstrual_cup_score,
        ) in rows
    ]


def get_wc_by_id(db: Session, wc_id: int) -> WC | None:
    row = (
        db.query(WC)
        .outerjoin(Review, Review.wc_id == WC.id)
        .filter(WC.id == wc_id, WC.is_active == True)
        .group_by(WC.id)
        .with_entities(
            WC,
            func.avg(Review.cleanliness_rating).label("avg_cleanliness"),
            func.count(Review.id).label("reviews_count"),
            _bool_avg_percentage(Review.felt_safe).label("safety_score"),
            _bool_avg_percentage(Review.accessible).label("accessibility_score"),
            _bool_avg_percentage(Review.has_toilet_paper).label("toilet_paper_score"),
            _bool_avg_percentage(Review.hygiene_products_available).label("hygiene_products_score"),
            _bool_avg_percentage(Review.could_enter_without_buying).label("free_entry_score"),
            _bool_avg_percentage(Review.has_gender_mixed_option).label("gender_mixed_score"),
            _bool_avg_percentage(Review.has_changing_table).label("changing_table_score"),
            _bool_avg_percentage(Review.step_free_access).label("step_free_score"),
            _bool_avg_percentage(Review.wide_door).label("wide_door_score"),
            _bool_avg_percentage(Review.turning_space).label("turning_space_score"),
            _bool_avg_percentage(Review.has_grab_bars).label("grab_bars_score"),
            _bool_avg_percentage(Review.menstrual_cup_suitable).label("menstrual_cup_score"),
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
        hygiene_products_score,
        free_entry_score,
        gender_mixed_score,
        changing_table_score,
        step_free_score,
        wide_door_score,
        turning_space_score,
        grab_bars_score,
        menstrual_cup_score,
    ) = row
    return _attach_review_stats(
        wc,
        avg_cleanliness,
        reviews_count,
        safety_score,
        accessibility_score,
        toilet_paper_score,
        hygiene_products_score,
        free_entry_score,
        gender_mixed_score,
        changing_table_score,
        step_free_score,
        wide_door_score,
        turning_space_score,
        grab_bars_score,
        menstrual_cup_score,
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
