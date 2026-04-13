"""add is_admin to users, is_active to wcs, indexes on fk columns

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-04-12

"""
from alembic import op
import sqlalchemy as sa

revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # is_admin on users (default False for existing rows)
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))

    # is_active on wcs (default True for existing rows)
    op.add_column('wcs', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Indexes on FK columns for reviews and favorites
    op.create_index('ix_reviews_wc_id', 'reviews', ['wc_id'])
    op.create_index('ix_reviews_user_id', 'reviews', ['user_id'])
    op.create_index('ix_favorites_wc_id', 'favorites', ['wc_id'])
    op.create_index('ix_favorites_user_id', 'favorites', ['user_id'])


def downgrade() -> None:
    op.drop_index('ix_favorites_user_id', table_name='favorites')
    op.drop_index('ix_favorites_wc_id', table_name='favorites')
    op.drop_index('ix_reviews_user_id', table_name='reviews')
    op.drop_index('ix_reviews_wc_id', table_name='reviews')
    op.drop_column('wcs', 'is_active')
    op.drop_column('users', 'is_admin')
