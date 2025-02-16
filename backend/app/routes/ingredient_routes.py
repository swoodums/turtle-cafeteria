# backend/app/routes/ingredient_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import or_
from typing import List, Optional

from app.schemas import ingredient_schema
from app.models import ingredient_model, measurement_model
from app.database import get_db

router = APIRouter(
    prefix="/ingredients",
    tags=["Ingredients"]
)



@router.post(
    "/",
    response_model=ingredient_schema.Ingredient,
    status_code=status.HTTP_201_CREATED
)
def create_ingredient(
    ingredient: ingredient_schema.IngredientCreate,
    db: Session = Depends(get_db)
):
    """
    Creates an ingredient.
    """

    # Verify the measurement unit exists
    unit_exists = db.query(measurement_model.MeasurementUnit).filter(
        measurement_model.MeasurementUnit.id == ingredient.unit_id
    ).first() is not None
    if not unit_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement unit with id {ingredient.unit_id} not found"
        )
    
    # Check if ingredient with same name already exists
    existing_ingredient = db.query(ingredient_model.Ingredient).filter(
        ingredient_model.Ingredient.name == ingredient.name
    ).first()
    if existing_ingredient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ingredient with name '{ingredient.name}' already exists"
        )
  
    db_ingredient = ingredient_model.Ingredient(**ingredient.model_dump())
    try:
        db.add(db_ingredient)
        db.commit()
        db.refresh(db_ingredient)
        return db_ingredient
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error creating ingredient.  Possible duplicate entry."
        )  
    


@router.get(
    "/",
    response_model=List[ingredient_schema.Ingredient]
)
def get_ingredients(
    offset: int=0,
    limit: int=100,
    category: Optional[ingredient_model.IngredientCategory] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all ingredients with optional filtering and search.
    - offset/limit for pagination
    - category to filter by ingredient category
    - search to filter by name (case-insensitive partial match)
    """

    query = db.query(ingredient_model.Ingredient)

    if category:
        query = query.filter(ingredient_model.Ingredient.category == category)

    if search:
        # Case insensitive search on name and description
        search_filter = or_(
            ingredient_model.Ingredient.name.ilike(f"%{search}%"),
            ingredient_model.Ingredient.description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)

    return query.offset(offset).limit(limit).all()



@router.get(
    "/{ingredient_id}",
    response_model=ingredient_schema.Ingredient
)
def get_ingredient(
    ingredient_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific ingredient by ID
    """

    ingredient = db.query(ingredient_model.Ingredient).filter(
        ingredient_model.Ingredient.id == ingredient_id
    ).first()
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {ingredient_id} not found"
        )
    return ingredient



@router.put(
    "/{ingredient_id}",
    response_model=ingredient_schema.Ingredient
)
def update_ingredient(
    ingredient_id: int,
    ingredient_update: ingredient_schema.IngredientCreate,
    db: Session = Depends(get_db)
):
    """
    Updates a specific ingredient
    """

    # Check if ingredient exists
    db_ingredient = db.query(ingredient_model.Ingredient).filter(
        ingredient_model.Ingredient.id == ingredient_id
    ).first()
    if db_ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {ingredient_id} not found"
        )
    
    # Verify the preferred unit exists
    unit_exists = db.query(measurement_model.MeasurementUnit).filter(
        measurement_model.MeasurementUnit.id == ingredient_update.preferred_unit_id
    ).first() is not None
    if not unit_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement unit with id {ingredient_update.preferred_unit_id} not found"
        )
    
    # Check if new name would conflict with existing ingredient
    if ingredient_update.name != db_ingredient.name:
        existing_ingredient = db.query(ingredient_model.Ingredient).filter(
            ingredient_model.Ingredient.name == ingredient_update.name
        ).first()
        if existing_ingredient:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ingredient with name '{ingredient_update.name}' already exists"
            )
        
    # Update fields
    for key, value in ingredient_update.model_dump().items():
        setattr(db_ingredient, key, value)

    db.commit()
    db.refresh(db_ingredient)
    return db_ingredient



@router.delete(
    "/{ingredient_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_ingredient(
    ingredient_id: int,
    db: Session = Depends(get_db)
):
    """
    Deletes a specific ingredient.
    Will fail if ingredient is used in any recipe.
    """

    ingredient = db.query(ingredient_model.Ingredient).filter(
        ingredient_model.Ingredient.id == ingredient_id
    ).first()
    if ingredient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingredient with id {ingredient_id} not found"
        )
    
    # Check if ingredient is used in any recipe
    recipe_count = db.query(ingredient_model.RecipeIngredient).filter(
        ingredient_model.RecipeIngredient.ingredient_id == ingredient_id
    ).count()
    if recipe_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete ingredient as it is used in {recipe_count} recipes"
        )
    
    db.delete(ingredient)
    db.commit()
    return None