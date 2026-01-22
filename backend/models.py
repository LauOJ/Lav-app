from sqlalchemy import (
    Column,
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
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reviews = relationship(
        "Review",
        back_populates="user",
        cascade="all, delete-orphan",
    )



class WC(Base):
    __tablename__ = "wcs"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(String, nullable=False)
    longitude = Column(String, nullable=False)

    accessible = Column(Boolean, nullable=False, default=False)
    gender_neutral = Column(Boolean, nullable=False, default=False)
    has_changing_table = Column(Boolean, nullable=False, default=False)
    only_for_customers = Column(Boolean, nullable=False, default=False)
    has_intimate_hygiene_products = Column(Boolean, nullable=False, default=False)

    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    reviews = relationship(
        "Review",
        back_populates="wc",
        cascade="all, delete-orphan",
    )



class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True)

    cleanliness_rating = Column(Integer, nullable=False)
    safety_rating = Column(Integer, nullable=False)

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
