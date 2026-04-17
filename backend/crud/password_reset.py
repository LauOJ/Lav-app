import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import PasswordResetToken, User
from security import hash_password


def create_reset_token(db: Session, user_id: int) -> PasswordResetToken:
    token = PasswordResetToken(
        user_id=user_id,
        token=str(uuid.uuid4()),
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        used=False,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token


def get_valid_token(db: Session, token_str: str) -> PasswordResetToken | None:
    return (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token == token_str,
            PasswordResetToken.used == False,
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )


def consume_token(db: Session, token: PasswordResetToken, new_password: str) -> None:
    user = db.get(User, token.user_id)
    user.password_hash = hash_password(new_password)
    token.used = True
    db.add(user)
    db.add(token)
    db.commit()
