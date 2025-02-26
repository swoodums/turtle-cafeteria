# backend/app/models/measurement_model.py

from typing import List
from enum import Enum as PyEnum     # Consistency in distinguishing from sqlalchemy Enum in other models
from sqlalchemy import ForeignKey, UniqueConstraint, CheckConstraint, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

class UnitCategory(PyEnum):
    """
    Categories for different types of measurements
    """
    VOLUME = "volume"
    WEIGHT = "weight"
    QUANTITY = "quantity"

class MeasurementUnit(Base):
    """
    Defines standard measurements units that can be used in recipes
    """
    __tablename__ = "measurement_units"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(unique=True)
    abbreviation: Mapped[str] = mapped_column(unique=True)
    category: Mapped[UnitCategory] = mapped_column(Enum(UnitCategory))
    is_metric: Mapped[bool] = mapped_column(default=False)
    is_common: Mapped[bool] = mapped_column(default=True) # For filtering less common units

    # Back references for conversions
    from_conversions: Mapped[List["UnitConversion"]] = relationship(
        "UnitConversion",
        foreign_keys="[UnitConversion.from_unit_id]",
        back_populates="from_unit",
        cascade="all, delete-orphan"
    )
    to_conversions: Mapped[List["UnitConversion"]] = relationship(
        "UnitConversion",
        foreign_keys="[UnitConversion.to_unit_id]",
        back_populates="to_unit",
        cascade="all, delete-orphan"
    )

    def __str__(self) -> str:
        return f"{self.name} ({self.abbreviation})"

class UnitConversion(Base):
    """
    Stores conversion ratios between different units
    Example: 1 cup = 236.588 ml, so from_unit="cup", to_unit="ml", ratio=236.588
    """
    __tablename__ = "unit_conversions"
    id: Mapped[int] = mapped_column(primary_key=True)
    from_unit_id: Mapped[int] = mapped_column(ForeignKey("measurement_units.id"))
    to_unit_id: Mapped[int] = mapped_column(ForeignKey("measurement_units.id"))
    ratio: Mapped[float] = mapped_column()  # multiply from_unit by ratio to get to_unit

    # Relationships using string literals for forward references
    from_unit: Mapped["MeasurementUnit"] = relationship(
        "MeasurementUnit",
        foreign_keys=[from_unit_id],
        back_populates="from_conversions"
    )
    to_unit: Mapped["MeasurementUnit"] = relationship(
        "MeasurementUnit",
        foreign_keys=[to_unit_id],
        back_populates="to_conversions"
    )

    # Ensure we don't have duplicate conversion pairs
    __table_args__ = (
        UniqueConstraint('from_unit_id', 'to_unit_id', name='unique_conversion_pair'),
        # Ensure we don't convert between different categories (e.g. volume to weight)
        CheckConstraint('from_unit_id != to_unit_id', name='different_units'),
    )