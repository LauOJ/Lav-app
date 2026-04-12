"""make review booleans nullable for prefer-not-to-say option

Revision ID: c3d4e5f6a7b8
Revises: 84beb084f9e4
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = '84beb084f9e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column('reviews', 'felt_safe', nullable=True)
    op.alter_column('reviews', 'accessible', nullable=True)
    op.alter_column('reviews', 'has_toilet_paper', nullable=True)
    op.alter_column('reviews', 'hygiene_products_available', nullable=True)
    op.alter_column('reviews', 'has_gender_mixed_option', nullable=True)


def downgrade() -> None:
    op.execute("UPDATE reviews SET felt_safe = false WHERE felt_safe IS NULL")
    op.execute("UPDATE reviews SET accessible = false WHERE accessible IS NULL")
    op.execute("UPDATE reviews SET has_toilet_paper = false WHERE has_toilet_paper IS NULL")
    op.execute("UPDATE reviews SET hygiene_products_available = false WHERE hygiene_products_available IS NULL")
    op.execute("UPDATE reviews SET has_gender_mixed_option = false WHERE has_gender_mixed_option IS NULL")
    op.alter_column('reviews', 'felt_safe', nullable=False)
    op.alter_column('reviews', 'accessible', nullable=False)
    op.alter_column('reviews', 'has_toilet_paper', nullable=False)
    op.alter_column('reviews', 'hygiene_products_available', nullable=False)
    op.alter_column('reviews', 'has_gender_mixed_option', nullable=False)
