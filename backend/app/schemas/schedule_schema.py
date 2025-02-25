# backend/app/schema/schedule_schema.py

from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator
from app.schemas.recipe_schema import Recipe
from app.models.schedule_model import MealType

# Schedule schemas

class ScheduleBase(BaseModel):
    start_date: date
    end_date: date
    meal_type: Optional[MealType] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator('end_date')
    @classmethod
    def end_date_must_not_precede_start_date(cls, v: date, info) -> date:
        start_date = info.data.get('start_date')
        if start_date and v < start_date:
            raise ValueError('end_date must not be before start_date')
        return v

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    meal_type: Optional[MealType] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

    @field_validator('end_date')
    @classmethod
    def end_date_must_not_precede_start_date(cls, v: date | None, info) -> date | None:
        if v is None:
            return v
        start_date = info.data.get('start_date')
        if start_date and v < start_date:
            raise ValueError('end_date must not be before start_date')
        return v

class Schedule(ScheduleBase):
    id: int
    recipe_id: int
    recipe: Recipe      # Enrich API response to include all recipe base data