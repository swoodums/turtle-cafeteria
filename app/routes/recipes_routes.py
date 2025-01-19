from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.schemas import recipe_schema
from app.models import recipe_model
from app.database import get_db

router = APIRouter(
    prefix="/recipe",
    tags=["Recipes"])

@router.post(
    "/",
    response_model=recipe_schema.Recipe,
)
def create_recipe(recipe: recipe_schema.RecipeBase, db: Session = Depends(get_db)):
    """
    Create a new recipe in the database.
    The recipe parameter contains the validated data from the request body.
    The db parameter is automatically provided by FastAPI using get_db dependency.
    """
    # Create a new Recipe model instance using the validated data
    db_recipe = recipe_model.Recipe(
        title=recipe.title,
        description = recipe.description,
        ingredients = recipe.ingredients,
        steps = recipe.steps,
        cooking_time = recipe.cooking_time,
        servings = recipe.servings
    )

    db.add(db_recipe)       # Add the new recipe to the database session
    db.commit()             # Commit the transaction to save the recipe
    db.refresh(db_recipe)   # Refresh the recipe object to ensure it contains any database-generated values

    return db_recipe

@router.get(
        "/",
        response_model=List[recipe_schema.Recipe]
)
def get_recipes(
    offset: int=0,
    limit: int=100,
    db: Session = Depends(get_db)
):
    """
    Retrieve a list of recipes with pagination support.
    Skip: number of recipes to skip (for pagination)
    limit: maximum number of recipes to return
    """
    recipes = db.query(recipe_model.Recipe).offset(offset).limit(limit).all()
    return recipes

@router.get(
    "/{recipe_id}",
    response_model=recipe_schema.Recipe
)
def get_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieves a specific recipe by its ID
    Raises 404 if the recipe is not found.
    """
    recipe = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first()
    if recipe is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    return recipe

@router.put(
    "/{recipe_id}",
    response_model=recipe_schema.Recipe
)
def update_recipe(
    recipe_id: int,
    recipe_updates: recipe_schema.RecipeBase,
    db: Session = Depends(get_db)
):
    """
    Update an existing recipe.
    recipe_updates contains the new data to update the recipe with.
    Raises 404 if the recipe is not found.
    """

    # First, get the existing recipe
    db_recipe = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found."
        )
    
    for key, value in recipe_updates.model_dump().items():  # Update the recipe's attributes
        setattr(db_recipe, key, value)
    db.commit()             # Commit the changes
    db.refresh(db_recipe)   # Refresh the recipe object to ensure it's up to date

    return db_recipe

@router.delete(
    "/{recipe_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def deleted_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a recipe by its ID.
    Returns 204 No Conbtent on success.
    Raises 404 if the recipe is not found. 
    """

    # Find the recipe
    db_recipe = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first()
    if db_recipe is None:
        raise HTTPException(
            status_code = status.HTTP_404_NOT_FOUND,
            detail = f"Recipe with id {recipe_id} not found."
        )
    
    db.delete(db_recipe)    # Delete the recipe
    db.commit()
    return None