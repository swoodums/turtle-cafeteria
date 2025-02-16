"""seed_measurement_units

Revision ID: 8a154e9660b8
Revises: e8809f42400f
Create Date: 2025-02-15 21:39:40.371767

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import table, column
from sqlalchemy.sql import text
from app.models.measurement_model import UnitCategory


# revision identifiers, used by Alembic.
revision: str = '8a154e9660b8'
down_revision: Union[str, None] = 'e8809f42400f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create reference tables for bulk insert
    measurement_units = table('measurement_units',
        column('id', sa.Integer),
        column('name', sa.String),
        column('abbreviation', sa.String),
        column('category', sa.Enum(UnitCategory)),
        column('is_metric', sa.Boolean),
        column('is_common', sa.Boolean)
    )

    # Insert measurement units
    op.bulk_insert(measurement_units, [
        # Volume (Metric)
        {'id': 1, 'name': 'Milliliter', 'abbreviation': 'ml', 'category': UnitCategory.VOLUME, 'is_metric': True, 'is_common': True},
        {'id': 2, 'name': 'Liter', 'abbreviation': 'L', 'category': UnitCategory.VOLUME, 'is_metric': True, 'is_common': True},
        
        # Volume (Imperial/US)
        {'id': 3, 'name': 'Teaspoon', 'abbreviation': 'tsp', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 4, 'name': 'Tablespoon', 'abbreviation': 'tbsp', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 5, 'name': 'Fluid Ounce', 'abbreviation': 'fl oz', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 6, 'name': 'Cup', 'abbreviation': 'cup', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 7, 'name': 'Pint', 'abbreviation': 'pt', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 8, 'name': 'Quart', 'abbreviation': 'qt', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        {'id': 9, 'name': 'Gallon', 'abbreviation': 'gal', 'category': UnitCategory.VOLUME, 'is_metric': False, 'is_common': True},
        
        # Weight (Metric)
        {'id': 10, 'name': 'Milligram', 'abbreviation': 'mg', 'category': UnitCategory.WEIGHT, 'is_metric': True, 'is_common': True},
        {'id': 11, 'name': 'Gram', 'abbreviation': 'g', 'category': UnitCategory.WEIGHT, 'is_metric': True, 'is_common': True},
        {'id': 12, 'name': 'Kilogram', 'abbreviation': 'kg', 'category': UnitCategory.WEIGHT, 'is_metric': True, 'is_common': True},
        
        # Weight (Imperial/US)
        {'id': 13, 'name': 'Ounce', 'abbreviation': 'oz', 'category': UnitCategory.WEIGHT, 'is_metric': False, 'is_common': True},
        {'id': 14, 'name': 'Pound', 'abbreviation': 'lb', 'category': UnitCategory.WEIGHT, 'is_metric': False, 'is_common': True},
        
        # Count/Quantity
        {'id': 15, 'name': 'Piece', 'abbreviation': 'pc', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': True},
        {'id': 16, 'name': 'Dozen', 'abbreviation': 'doz', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': False},
        {'id': 17, 'name': 'Pinch', 'abbreviation': 'pinch', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': False},
        {'id': 18, 'name': 'Clove', 'abbreviation': 'clove', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': True},
        {'id': 19, 'name': 'Slice', 'abbreviation': 'slice', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': False},
        {'id': 20, 'name': 'Bunch', 'abbreviation': 'bunch', 'category': UnitCategory.QUANTITY, 'is_metric': False, 'is_common': False},
    ])


def downgrade() -> None:
    # Remove all seeded data
    op.execute('DELETE FROM measurement_units')
