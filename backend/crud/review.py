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
        safety_rating=review_in.safety_rating,
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
    review.safety_rating = review_in.safety_rating
    review.comment = review_in.comment

    db.commit()
    db.refresh(review)
    return review


def get_reviews_by_wc_id(db: Session, wc_id: int) -> list[Review]:
    return db.query(Review).filter(Review.wc_id == wc_id).all()


def get_reviews_by_user_id(db: Session, user_id: int) -> list[Review]:
    return db.query(Review).filter(Review.user_id == user_id).all()