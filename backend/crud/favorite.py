from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models import Favorite, WC


def add_favorite(db: Session, user_id: int, wc_id: int) -> Favorite | None:
    """Add a favorite. Returns None if WC does not exist or duplicate."""
    if db.get(WC, wc_id) is None:
        return None
    favorite = Favorite(user_id=user_id, wc_id=wc_id)
    db.add(favorite)
    try:
        db.commit()
        db.refresh(favorite)
        return favorite
    except IntegrityError:
        db.rollback()
        return None


def remove_favorite(db: Session, user_id: int, wc_id: int) -> bool:
    """Remove a favorite. Returns True if removed, False if not found."""
    fav = (
        db.query(Favorite)
        .filter(Favorite.user_id == user_id, Favorite.wc_id == wc_id)
        .first()
    )
    if not fav:
        return False
    db.delete(fav)
    db.commit()
    return True


def get_user_favorites(db: Session, user_id: int) -> list[Favorite]:
    """Return all favorites for the user."""
    return db.query(Favorite).filter(Favorite.user_id == user_id).all()
