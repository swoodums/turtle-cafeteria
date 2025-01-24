from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from app.schemas import recipe_schema
from app.models import recipe_model
from app.database import get_db

router = APIRouter(
    prefix="/step",
    tags=["Steps"]
)

@router.post(
    "/recipe/{recipe_id}",
    response_model=recipe_schema.Step,
    status_code=status.HTTP_201_CREATED
)
def create_step(
    recipe_id: int,
    step: recipe_schema.StepCreate,
    db: Session = Depends(get_db)
):
    """
    Creates a step for a given recipe id.
    Ensures step number is unique for the recipe
    """

    # Verify the recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first() is not None
    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Create the step with the provided step number
    db_step = recipe_model.Step(
        recipe_id=recipe_id,
        step_number=step.step_number,
        instruction=step.instruction
    )

    try:
        db.add(db_step)
        db.commit()
        db.refresh(db_step)
        return db_step
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Step number {step.step_number} already exists for recipe {recipe_id}"
        )

@router.get(
    "/recipe/{recipe_id}",
    response_model=List[recipe_schema.Step]
)
def get_steps_for_recipe(
    recipe_id: int,
    db: Session = Depends(get_db)
):
    """
    Retrieve all steps for a specific recipe
    """

    # Verify recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(recipe_model.Recipe.id == recipe_id).first() is not None
    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    steps = db.query(recipe_model.Step).filter(recipe_model.Step.recipe_id == recipe_id).all()
    if steps is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} has no steps associated with it"
        )
    return steps

@router.get(
    "/{step_id}",
    response_model=recipe_schema.Step
)
def get_step(
    step_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific step by its ID
    """
    step = db.query(recipe_model.Step).filter(recipe_model.Step.id == step_id).first()
    if step is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step with is {step_id} not found"
        )
    return step

@router.put(
    "/{step_id}",
    response_model=recipe_schema.Step
)
def update_step(
    step_id: int,
    step_update: recipe_schema.StepCreate,
    db: Session = Depends(get_db)
):
    """
    Update a specific step
    """
    db_step = db.query(recipe_model.Step).filter(recipe_model.Step.id == step_id).first()   # Retrieves existing step
    if db_step is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step with id {step_id} not found"
        )

    db_step.step_number = step_update.step_number
    db_step.instruction = step_update.instruction

    db.commit()
    db.refresh(db_step)
    return db_step

@router.delete(
    "/{step_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_step(
    step_id: int,
    db: Session = Depends(get_db)
):
    """
    Deleted a specific step
    """
    db_step = db.query(recipe_model.Step).filter(recipe_model.Step.id == step_id).first()
    if db_step is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Step with id {step_id} not found"
        )
    
    db.delete(db_step)
    db.commit()
    return None