"""Adding meal-type to schedules

Revision ID: 013acfc1972a
Revises: 71d43715600a
Create Date: 2025-02-03 09:56:44.940510

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '013acfc1972a'
down_revision: Union[str, None] = '71d43715600a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('schedules', sa.Column('meal_type', sa.String(), nullable=True))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('schedules', 'meal_type')
    # ### end Alembic commands ###
