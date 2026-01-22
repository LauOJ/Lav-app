"""change latitude longitude to float

Revision ID: 499721f8ff5f
Revises: bca5b10e44c8
Create Date: 2026-01-22 10:48:33.906998

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '499721f8ff5f'
down_revision: Union[str, Sequence[str], None] = 'bca5b10e44c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE wcs
        ALTER COLUMN latitude TYPE DOUBLE PRECISION
        USING latitude::double precision,
        ALTER COLUMN longitude TYPE DOUBLE PRECISION
        USING longitude::double precision
    """)

    # ### end Alembic commands ###


def downgrade() -> None:
    op.execute("""
        ALTER TABLE wcs
        ALTER COLUMN latitude TYPE TEXT,
        ALTER COLUMN longitude TYPE TEXT
    """)

    # ### end Alembic commands ###
