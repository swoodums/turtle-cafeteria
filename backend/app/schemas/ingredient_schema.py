# backend/app/schemas/ingredient_schema.py

from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.ingredient_model import IngredientCategory
from app.schemas.measurement_schema import MeasurementUnit

class IngredientBase(BaseModel):
    name: str
    preferred_unit_id: int
    category: IngredientCategory
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    preferred_unit: MeasurementUnit