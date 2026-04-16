"""add language_preference to users

Revision ID: g7h8i9j0k1l2
Revises: f6a7b8c9d0e1
Branch Labels: None
Depends On: None

"""
from alembic import op
import sqlalchemy as sa

revision = 'g7h8i9j0k1l2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column(
            'language_preference',
            sa.String(5),
            nullable=False,
            server_default='ca',
        ),
    )


def downgrade() -> None:
    op.drop_column('users', 'language_preference')
