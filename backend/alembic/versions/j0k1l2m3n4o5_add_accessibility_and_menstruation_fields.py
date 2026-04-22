"""add accessibility detail and menstruation fields to reviews

Revision ID: j0k1l2m3n4o5
Revises: i9j0k1l2m3n4
Branch Labels: None
Depends On: None

"""
from alembic import op
import sqlalchemy as sa

revision = 'j0k1l2m3n4o5'
down_revision = 'i9j0k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('reviews', sa.Column('step_free_access', sa.Boolean(), nullable=True))
    op.add_column('reviews', sa.Column('wide_door', sa.Boolean(), nullable=True))
    op.add_column('reviews', sa.Column('turning_space', sa.Boolean(), nullable=True))
    op.add_column('reviews', sa.Column('has_grab_bars', sa.Boolean(), nullable=True))
    op.add_column('reviews', sa.Column('menstrual_cup_suitable', sa.Boolean(), nullable=True))


def downgrade() -> None:
    op.drop_column('reviews', 'menstrual_cup_suitable')
    op.drop_column('reviews', 'has_grab_bars')
    op.drop_column('reviews', 'turning_space')
    op.drop_column('reviews', 'wide_door')
    op.drop_column('reviews', 'step_free_access')
