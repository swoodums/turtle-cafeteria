from pydantic import BaseModel, ConfigDict

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
    name: str
    quantity: float
    unit: str

class RecipeIngredientCreate(RecipeIngredientBase):
    pass

class RecipeIngredient(RecipeIngredientBase):
    id: int
    recipe_id: int
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