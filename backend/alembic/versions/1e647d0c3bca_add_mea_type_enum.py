"""add_mea_type_enum

Revision ID: 1e647d0c3bca
Revises: 013acfc1972a
Create Date: 2025-02-03 13:09:02.493575

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1e647d0c3bca'
down_revision: Union[str, None] = '013acfc1972a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# Define valid meal types
VALID_MEAL_TYPES = ("breakfast", "lunch", "dinner", "snacks")

def upgrade() -> None:
    # SQLite doesn't support adding constraints directly
    # We need to create a new table with constraints, copy data over, drop old table, and rename new table.
    
    # Create new table
    op.create_table(
        'schedules_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('meal_type', sa.String(), 
                 sa.CheckConstraint(f"meal_type IN {VALID_MEAL_TYPES} OR meal_type IS NULL"),
                 nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('end_date >= start_date', name='valid_date_range')
    )

    # Copy data
    op.execute(
        'INSERT INTO schedules_new SELECT id, recipe_id, start_date, end_date, '
        'CASE WHEN meal_type NOT IN ("breakfast", "lunch", "dinner", "snacks") '
        'THEN NULL ELSE meal_type END, '
        'notes FROM schedules'
    )

    # Drop old table
    op.drop_table('schedules')

    # Rename new table
    op.rename_table('schedules_new', 'schedules')
    # ### end Alembic commands ###


def downgrade() -> None:
    # Remove the contraint by recreating the table without it
    op.create_table(
        'schedules_new',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipe_id', sa.Integer(), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('meal_type', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['recipe_id'], ['recipes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.CheckConstraint('end_date >= start_date', name='valid_date_range')
    )

    # Copy all data
    op.execute(
        'INSERT INTO schedules_new SELECT * FROM schedules'
    )

    # Drop old table
    op.drop_table('schedules')

    # Rename new table
    op.rename_table('schedules_new', 'schedules')
    # ### end Alembic commands ###
