from pydantic import BaseModel, ConfigDict, Field
from app.models.ingredient_model import Ingredient
from app.models.measurement_model import MeasurementUnit

# Direction schemas

class DirectionBase(BaseModel):
    direction_number: int
    instruction: str

class DirectionCreate(DirectionBase):
    pass

class Direction(DirectionBase):
    id: int
    recipe_id: int
    model_config=ConfigDict(from_attributes=True)

# Ingredient schemas

class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity: float = Field(gt=0)   # quantity must be positive
    unit_id: int

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredient(RecipeIngredientBase):
    id: int
    recipe_id: int
    ingredient: Ingredient
    unit: MeasurementUnit
    model_config=ConfigDict(from_attributes=True)

# Recipe schemas

class RecipeBase(BaseModel):
    title: str
    description: str
    cooking_time: int
    servings: int

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)