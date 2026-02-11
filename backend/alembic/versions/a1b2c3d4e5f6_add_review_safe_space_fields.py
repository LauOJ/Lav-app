"""add review is_safe_space and safe_space_comment

Revision ID: a1b2c3d4e5f6
Revises: 499721f8ff5f
Create Date: 2026-02-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '499721f8ff5f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('reviews', sa.Column('is_safe_space', sa.Boolean(), nullable=True))
    op.add_column('reviews', sa.Column('safe_space_comment', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('reviews', 'safe_space_comment')
    op.drop_column('reviews', 'is_safe_space')
