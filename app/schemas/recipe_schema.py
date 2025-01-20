from pydantic import BaseModel, ConfigDict

class RecipeBase(BaseModel):
    title: str
    description: str
    ingredients: str
    steps: str
    cooking_time: int
    servings: int

class Recipe(RecipeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)