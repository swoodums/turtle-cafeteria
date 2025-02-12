# backend/app/models/ingredient_model.py

from typing import List, Optional
from sqlalchemy import ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum as PyEnum     # To distinguish this class from SQLAlchemy Enum class
from app.models.base import Base

class IngredientCategory(PyEnum):
    PRODUCE = "produce"
    MEAT = "meat"
    DAIRY = "dairy"
    GRAINS = "grains"
    SPICES = "spices"
    PANTRY = "pantry"
    OTHER = "other"

class Ingredient(Base):
    """
    Ingredient model representing the ingredients table.
    This is the master list of all possible ingredients.
    """
    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True, index=True)
    preferred_unit_id: Mapped[int] = mapped_column(ForeignKey("measurement_units.id"))
    category: Mapped[IngredientCategory] = mapped_column(Enum(IngredientCategory))
    description: Mapped[Optional[str]] = mapped_column(nullable=True)

    # Relationships
    preferred_unit: Mapped["MeasurementUnit"] = relationship("MeasurementUnit")
    recipe_ingredients: Mapped[List["RecipeIngredient"]] = relationship(
        "RecipeIngredient",
        back_populates="ingredient",
        cascade="all, delete-orphan"
    )