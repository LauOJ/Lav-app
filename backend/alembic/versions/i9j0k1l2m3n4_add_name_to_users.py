"""add name to users

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Branch Labels: None
Depends On: None

"""
from alembic import op
import sqlalchemy as sa

revision = 'i9j0k1l2m3n4'
down_revision = 'h8i9j0k1l2m3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('name', sa.String(100), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'name')
