"""move changing_table from wc to review

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-04-12

"""
from alembic import op
import sqlalchemy as sa

revision = 'd4e5f6a7b8c9'
down_revision = 'c3d4e5f6a7b8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_column('wcs', 'has_changing_table')
    op.add_column('reviews', sa.Column('has_changing_table', sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column('reviews', 'has_changing_table')
    op.add_column('wcs', sa.Column('has_changing_table', sa.Boolean(), nullable=False, server_default=sa.false()))
