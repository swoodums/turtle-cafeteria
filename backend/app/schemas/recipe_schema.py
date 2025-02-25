# backend/app/schemas/recipe_schema.py

from pydantic import BaseModel, ConfigDict, Field
from app.schemas.ingredient_schema import Ingredient
from app.schemas.measurement_schema import MeasurementUnit

# Direction schemas


class DirectionBase(BaseModel):
    direction_number: int
    instruction: str
    model_config = ConfigDict(from_attributes=True)


class DirectionCreate(DirectionBase):
    pass


class Direction(DirectionBase):
    id: int
    recipe_id: int


# Recipe Ingredient schemas


class RecipeIngredientBase(BaseModel):
    ingredient_id: int
    quantity: float = Field(gt=0)  # quantity must be positive
    unit_id: int

    model_config = ConfigDict(from_attributes=True)


class RecipeIngredientCreate(RecipeIngredientBase):
    pass


class RecipeIngredient(RecipeIngredientBase):
    id: int
    recipe_id: int
    ingredient: Ingredient
    unit: MeasurementUnit


# Recipe schemas


class RecipeBase(BaseModel):
    title: str
    description: str
    cooking_time: int
    servings: int

    model_config = ConfigDict(from_attributes=True)


class RecipeCreate(RecipeBase):
    pass


class Recipe(RecipeBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
    directions: list[Direction] | None = None
    recipe_ingredients: list[RecipeIngredient] | None = None
