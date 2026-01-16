from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from database import get_db
from schemas.review import ReviewCreate, ReviewRead
from crud.review import create_review, delete_review
from security import get_current_user
from models import User


router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

@router.post(
    "",
    response_model=ReviewRead,
    status_code=status.HTTP_201_CREATED,
)
def create_review_endpoint(
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        review = create_review(
            db=db,
            review_in=review_in,
            user_id=current_user.id,
        )

        return review
    except IntegrityError:
        raise HTTPException(
            status_code=400,
            detail="User already reviewed this WC or invalid references",
        )


@router.delete(
    "/{review_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_review_endpoint(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        deleted = delete_review(
            db=db,
            review_id=review_id,
            user_id=current_user.id,
        )

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Review not found",
            )

    except PermissionError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to delete this review",
        )
