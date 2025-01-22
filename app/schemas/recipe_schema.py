from pydantic import BaseModel, ConfigDict
from typing import List, Optional

# Step schemas

class StepBase(BaseModel):
    step_number: int
    instruction: str

class StepCreate(StepBase):
    pass

class Step(StepBase):
    id: int
    recipe_id: int
    model_config=ConfigDict(from_attributes=True)

# Recipe schemas

class RecipeBase(BaseModel):
    title: str
    description: str
    ingredients: str
    cooking_time: int
    servings: int

class RecipeCreate(RecipeBase):
    pass

class Recipe(RecipeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)