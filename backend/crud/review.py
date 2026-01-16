from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import Review
from schemas.review import ReviewCreate

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
