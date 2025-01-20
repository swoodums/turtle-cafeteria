from pydantic import BaseModel, ConfigDict
from typing import Optional

class RecipeBase(BaseModel):
    title: str
    description: str
    ingredients: str
    steps: str
    cooking_time: int
    servings: int

class RecipeUpdate(RecipeBase):
    # Override all fields as optional - allows for only updating some fields in the PUT endpoint and not having to update every field in the object.
    title: Optional[str] = None
    description: Optional[str] = None
    ingredients: Optional[str] = None
    steps: Optional[str] = None
    cooking_time: Optional[int] = None
    servings: Optional[int] = None

class Recipe(RecipeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)