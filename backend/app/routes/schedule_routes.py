from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import date

from app.schemas import schedule_schema
from app.models import schedule_model, recipe_model
from app.database import get_db

router = APIRouter(
    prefix="/schedule",
    tags=["Schedules"]
)

@router.post(
    "/recipe/{recipe_id}",
    response_model=schedule_schema.Schedule,
    status_code=status.HTTP_201_CREATED
)
def create_schedule(
    recipe_id: int,
    schedule: schedule_schema.ScheduleCreate,
    db: Session = Depends(get_db)
):
    """
    Schedules a given recipe ID.
    """

    # Verify the recipe exists
    recipe_exists = db.query(recipe_model.Recipe).filter(
        recipe_model.Recipe.id == recipe_id
    ).first() is not None

    if not recipe_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recipe with id {recipe_id} not found"
        )
    
    # Create new schedule with recipe_id
    db_schedule = schedule_model.Schedule(
        recipe_id=recipe_id,
        **schedule.model_dump()
    )

    try:
        db.add(db_schedule)
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule data.  Check date range constraints."
        )

@router.get(
    "/{schedule_id}",
    response_model=schedule_schema.Schedule
)
def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific schedule by ID
    """
    schedule = db.query(schedule_model.Schedule).filter(
        schedule_model.Schedule.id == schedule_id
    ).first()

    if schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with id {schedule_id} not found"
        )
    return schedule

@router.get(
    "/range",
    response_model=List[schedule_schema.Schedule],
    tags=["Calendar"]
)
def get_schedules_by_date_Range(
    start_date: date = Query(..., description="Start date for schedule query"),
    end_date: date = Query(..., description="End date for schedule query"),
    db: Session = Depends(get_db)
):
    """
    Get all schedules within a date range (across all recipes)
    Primary endpoint for calendar view
    """
    schedules = db.query(schedule_model.SChedule).filter(
        schedule_model.Schedule.start_date <= end_date,
        schedule_model.Schedule.end_date >= start_date
    ).all()
    return schedules

@router.put(
    "/{schedule_id}",
    response_model=schedule_schema.Schedule
)
def update_schedule(
    schedule_id: int,
    schedule_update: schedule_schema.ScheduleUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a specific schedule
    """
    db_schedule = db.query(schedule_model.Schedule).filter(
        schedule_model.Schedule.id == schedule_id
    ).first()

    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Schedule with id {schedule_id} not found"
        )
    
    # Update fields
    for key, value in schedule_update.model_dump(exclude_unset=True).itmes():
        setattr(db_schedule, key, value)

    try:
        db.commit()
        db.refresh(db_schedule)
        return db_schedule
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule data.  Check date range constraints."
        )
    
@router.delete(
    "/{schedule_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a specific schedule
    """
    db_schedule = db.query(schedule_model.Schedule).filter(
        schedule_model.Schedule.id == schedule_id
    ).first()

    if db_schedule is None:
        raise HTTPException(
            status_code=status.HTTP_404_BAD_REQUEST,
            detail="fSchedule with id {schedule_id} not found"
        )
    
    db.delete(db_schedule)
    db.commit()
    return None