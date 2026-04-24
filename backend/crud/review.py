from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import Review
from schemas.review import ReviewCreate, ReviewUpdate

def create_review(
    db: Session,
    review_in: ReviewCreate,
    user_id: int,
):
    review = Review(
        wc_id=review_in.wc_id,
        cleanliness_rating=review_in.cleanliness_rating,
        felt_safe=review_in.felt_safe,
        accessible=review_in.accessible,
        has_toilet_paper=review_in.has_toilet_paper,
        hygiene_products_available=review_in.hygiene_products_available,
        could_enter_without_buying=review_in.could_enter_without_buying,
        has_gender_mixed_option=review_in.has_gender_mixed_option,
        has_changing_table=review_in.has_changing_table,
        changing_table_location=review_in.changing_table_location,
        step_free_access=review_in.step_free_access,
        wide_door=review_in.wide_door,
        turning_space=review_in.turning_space,
        has_grab_bars=review_in.has_grab_bars,
        menstrual_cup_suitable=review_in.menstrual_cup_suitable,
        comment=review_in.comment,
        user_id=user_id,
    )

    db.add(review)
    db.commit()
    db.refresh(review)
    return review

def delete_review(
    db: Session,
    review_id: int,
    user_id: int,
) -> bool:
    review = db.get(Review, review_id)

    if not review:
        return False

    if review.user_id != user_id:
        raise PermissionError

    db.delete(review)
    db.commit()
    return True


def update_review(
    db: Session,
    review_id: int,
    user_id: int,
    review_in: ReviewUpdate,
) -> Review | None:
    review = db.get(Review, review_id)

    if not review:
        return None

    if review.user_id != user_id:
        raise PermissionError

    review.cleanliness_rating = review_in.cleanliness_rating
    review.felt_safe = review_in.felt_safe
    review.accessible = review_in.accessible
    review.has_toilet_paper = review_in.has_toilet_paper
    review.hygiene_products_available = review_in.hygiene_products_available
    review.could_enter_without_buying = review_in.could_enter_without_buying
    review.has_gender_mixed_option = review_in.has_gender_mixed_option
    review.has_changing_table = review_in.has_changing_table
    review.changing_table_location = review_in.changing_table_location
    review.step_free_access = review_in.step_free_access
    review.wide_door = review_in.wide_door
    review.turning_space = review_in.turning_space
    review.has_grab_bars = review_in.has_grab_bars
    review.menstrual_cup_suitable = review_in.menstrual_cup_suitable
    review.comment = review_in.comment

    db.commit()
    db.refresh(review)
    return review


def get_reviews_by_wc_id(db: Session, wc_id: int) -> list[Review]:
    return db.query(Review).filter(Review.wc_id == wc_id).all()


def get_reviews_by_user_id(db: Session, user_id: int) -> list[Review]:
    return db.query(Review).filter(Review.user_id == user_id).all()


def get_review_by_user_and_wc(db: Session, user_id: int, wc_id: int) -> Review | None:
    return db.query(Review).filter(Review.user_id == user_id, Review.wc_id == wc_id).first()