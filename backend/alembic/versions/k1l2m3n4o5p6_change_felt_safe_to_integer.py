"""change felt_safe from boolean to integer rating 1-5

Revision ID: k1l2m3n4o5p6
Revises: j0k1l2m3n4o5
Branch Labels: None
Depends On: None

"""
from alembic import op
import sqlalchemy as sa

revision = 'k1l2m3n4o5p6'
down_revision = 'j0k1l2m3n4o5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add temporary integer column
    op.add_column('reviews', sa.Column('felt_safe_new', sa.Integer(), nullable=True))
    # Convert existing boolean values: True→5, False→1, NULL stays NULL
    op.execute("""
        UPDATE reviews
        SET felt_safe_new = CASE
            WHEN felt_safe = true  THEN 5
            WHEN felt_safe = false THEN 1
            ELSE NULL
        END
    """)
    op.drop_column('reviews', 'felt_safe')
    op.alter_column('reviews', 'felt_safe_new', new_column_name='felt_safe')


def downgrade() -> None:
    op.add_column('reviews', sa.Column('felt_safe_bool', sa.Boolean(), nullable=True))
    op.execute("""
        UPDATE reviews
        SET felt_safe_bool = CASE
            WHEN felt_safe >= 3 THEN true
            WHEN felt_safe <  3 THEN false
            ELSE NULL
        END
    """)
    op.drop_column('reviews', 'felt_safe')
    op.alter_column('reviews', 'felt_safe_bool', new_column_name='felt_safe')
