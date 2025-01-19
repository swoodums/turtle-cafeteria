from pydantic import BaseModel

class RecipeBase(BaseModel):
    title: str
    description: str
    ingredients: str
    steps: str
    cooking_time: int
    servings: int

class Recipe(RecipeBase):
    id: int

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models