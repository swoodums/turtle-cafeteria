# backend/app/models/schedule_model.py

from typing import Optional
from datetime import date
from sqlalchemy import Text, ForeignKey, Date, CheckConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base
from app.schemas.schedule_schema import MealType

class Schedule(Base):
    """
    Schedule model representing when recipes are scheduled.
    """
    __tablename__ = "schedules"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    meal_type: Mapped[Optional[MealType]] = mapped_column(Enum(MealType))
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship to recipes
    recipe: Mapped["Recipe"] = relationship("Recipe", back_populates="schedules")

    # Add constraints to ensure end_date >= start_date
    __table_args__ = (
        CheckConstraint('end_date >= start_date', name='valid_date_range'),
    )