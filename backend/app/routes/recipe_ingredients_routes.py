from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.schemas import recipe_schema
from app.models import recipe_model
from app.database import get_db

router = APIRouter(
    prefix="/recipe_ingredients",
    tags=["Recipe Ingredients"]
)

@router.post(
    "/recipe/{recipe_id}",
    response_model=recipe_schema.RecipeIngredient,
    status_code=status.HTTP_201_CREATED
)
def create_recipe_ingredient(
    recipe_id: int,
    recipe_ingredient: recipe_schema.RecipeIngredientCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a recipe ingredient for a given recipe id.
    Ensures recipe ingredient number is unique for the recipe
    """

    # Verify the recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first() is not None
    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
  
    db_recipe_ingredient = recipe_model.RecipeIngredient(
        recipe_id = recipe_id,
        name = recipe_ingredient.name,
        quantity = recipe_ingredient.quantity,
        unit = recipe_ingredient.unit
    )

    db.add(db_recipe_ingredient)
    db.commit()
    db.refresh(db_recipe_ingredient)
    
    return db_recipe_ingredient

@router.get(
    "/recipe/{recipe_id}",
    response_model=List[recipe_schema.RecipeIngredient]
)
def get_recipe_ingredients_for_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve all directions for a specific recipe
    """

    # Verify recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first() is not None
    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    recipe_ingredients = db.query(recipe_model.RecipeIngredient).filter(recipe_model.RecipeIngredient.recipe_id == recipe_id).all()
    if recipe_ingredients is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} has no directions associated with it"
        )
    return recipe_ingredients

@router.get(
    "/{recipe_ingredient_id}",
    response_model=recipe_schema.RecipeIngredient
)
def get_recipe_ingredient(
    recipe_ingredient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific direction by its ID
    """
    recipe_ingredient = db.query(recipe_model.RecipeIngredient).filter(recipe_model.RecipeIngredient.id == recipe_ingredient_id).first()
    if recipe_ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe Ingredient with id {recipe_ingredient_id} not found"
        )
    return recipe_ingredient

@router.put(
    "/{recipe_ingredient_id}",
    response_model=recipe_schema.RecipeIngredient
)
def update_recipe_ingredient(
    recipe_ingredient_id: int,
    recipe_ingredient_update: recipe_schema.RecipeIngredientCreate,
    db: Session = Depends(get_db)
):
    """
    Update a specific recipe ingredient
    """
    db_recipe_ingredient = db.query(recipe_model.RecipeIngredient).filter(recipe_model.RecipeIngredient.id == recipe_ingredient_id).first()   # Retrieves existing directions
    if db_recipe_ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe Ingredient with id {recipe_ingredient_id} not found"
        )

    db_recipe_ingredient.name = recipe_ingredient_update.name
    db_recipe_ingredient.quantity = recipe_ingredient_update.quantity
    db_recipe_ingredient.unit = recipe_ingredient_update.unit

    db.commit()
    db.refresh(db_recipe_ingredient)
    return db_recipe_ingredient

@router.delete(
    "/{recipe_ingredient_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_recipe_ingredient(
    recipe_ingredient_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleted a specific direction
    """
    db_recipe_ingredient = db.query(recipe_model.RecipeIngredient).filter(recipe_model.RecipeIngredient.id == recipe_ingredient_id).first()
    if db_recipe_ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe Ingredient with id {recipe_ingredient_id} not found"
        )
    
    db.delete(db_recipe_ingredient)
    db.commit()
    return None