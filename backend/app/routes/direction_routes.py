from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.schemas import recipe_schema
from app.models import recipe_model
from app.database import get_db

router = APIRouter(
    prefix="/direction",
    tags=["Directions"]
)

@router.post(
    "/recipe/{recipe_id}",
    response_model=recipe_schema.Direction,
    status_code=status.HTTP_201_CREATED
)
def create_direction(
    recipe_id: int,
    direction: recipe_schema.DirectionCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a direction for a given recipe id.
    Ensures direction number is unique for the recipe
    """

    # Verify the recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first() is not None
    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Create the direction with the provided direction number
    db_direction = recipe_model.Direction(
        recipe_id=recipe_id,
        direction_number=direction.direction_number,
        instruction=direction.instruction
    )

    try:
        db.add(db_direction)
        db.commit()
        db.refresh(db_direction)
        return db_direction
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Direction number {direction.direction_number} already exists for recipe {recipe_id}"
        )

@router.get(
    "/recipe/{recipe_id}",
    response_model=List[recipe_schema.Direction]
)
def get_directions_for_recipe(
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
    
    directions = db.query(recipe_model.Direction).filter(recipe_model.Direction.recipe_id == recipe_id).all()
    if directions is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} has no directions associated with it"
        )
    return directions

@router.get(
    "/{direction_id}",
    response_model=recipe_schema.Direction
)
def get_direction(
    direction_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific direction by its ID
    """
    direction = db.query(recipe_model.Direction).filter(recipe_model.Direction.id == direction_id).first()
    if direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Direction with id {direction_id} not found"
        )
    return direction

@router.put(
    "/{direction_id}",
    response_model=recipe_schema.Direction
)
def update_direction(
    direction_id: int,
    direction_update: recipe_schema.DirectionCreate,
    db: Session = Depends(get_db)
):
    """
    Update a specific direction
    """
    db_direction = db.query(recipe_model.Direction).filter(recipe_model.Direction.id == direction_id).first()   # Retrieves existing directions
    if db_direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Direction with id {direction_id} not found"
        )

    db_direction.direction_number = direction_update.direction_number
    db_direction.instruction = direction_update.instruction

    db.commit()
    db.refresh(db_direction)
    return db_direction

@router.delete(
    "/{direction_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_direction(
    direction_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleted a specific direction
    """
    db_direction = db.query(recipe_model.Direction).filter(recipe_model.Direction.id == direction_id).first()
    if db_direction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Direction with id {direction_id} not found"
        )
    
    db.delete(db_direction)
    db.commit()
    return None