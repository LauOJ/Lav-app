from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import Review
from schemas.review import ReviewCreate

def create_review(db: Session, review_in: ReviewCreate) -> Review:
    review = Review(**review_in.model_dump())
    db.add(review)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise

    db.refresh(review)
    return review
