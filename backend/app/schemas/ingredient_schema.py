# backend/app/schemas/ingredient_schema.py

from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator, Field
from app.models.ingredient_model import IngredientCategory
from app.models.measurement_model import MeasurementUnit

class IngredientBase(BaseModel):
    name: str
    preferred_unit_id: int
    category: IngredientCategory
    description: Optional[str] = None

class IngredientCreate(IngredientBase):
    pass

class Ingredient(IngredientBase):
    id: int
    preferred_unit: MeasurementUnit
    model_config = ConfigDict(from_attributes=True)