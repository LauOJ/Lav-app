from sqlalchemy import (
    Column,
    Float,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from database import Base



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_admin = Column(Boolean, nullable=False, default=False)
    language_preference = Column(String(5), nullable=False, server_default='ca')
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    favorites = relationship(
        "Favorite",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    password_reset_tokens = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class WC(Base):
    __tablename__ = "wcs"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    is_public = Column(Boolean, nullable=False, default=True)
    is_active = Column(Boolean, nullable=False, default=True)

    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reviews = relationship(
        "Review",
        back_populates="wc",
        cascade="all, delete-orphan",
    )
    favorites = relationship(
        "Favorite",
        back_populates="wc",
        cascade="all, delete-orphan",
    )


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)

    cleanliness_rating = Column(Integer, nullable=False)
    felt_safe = Column(Boolean, nullable=True)
    accessible = Column(Boolean, nullable=True)
    has_toilet_paper = Column(Boolean, nullable=True)
    hygiene_products_available = Column(Boolean, nullable=True)
    could_enter_without_buying = Column(Boolean, nullable=True)
    has_gender_mixed_option = Column(Boolean, nullable=True)
    has_changing_table = Column(Boolean, nullable=True)
    changing_table_location = Column(String(10), nullable=True)  # 'mens', 'womens', 'mixed'

    # Accessibilitat (detall)
    step_free_access = Column(Boolean, nullable=True)
    wide_door = Column(Boolean, nullable=True)
    turning_space = Column(Boolean, nullable=True)
    has_grab_bars = Column(Boolean, nullable=True)

    # Menstruació
    menstrual_cup_suitable = Column(Boolean, nullable=True)

    comment = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    wc_id = Column(
        Integer,
        ForeignKey("wcs.id", ondelete="CASCADE"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("user_id", "wc_id", name="uq_user_wc_review"),
    )

    # Relationships
    user = relationship("User", back_populates="reviews")
    wc = relationship("WC", back_populates="reviews")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    token = Column(String(36), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="password_reset_tokens")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    wc_id = Column(
        Integer,
        ForeignKey("wcs.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "wc_id", name="uq_user_wc_favorite"),
    )

    user = relationship("User", back_populates="favorites")
    wc = relationship("WC", back_populates="favorites")
