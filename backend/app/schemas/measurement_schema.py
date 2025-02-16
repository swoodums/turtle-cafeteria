# backend/app/schemas/measurement_schema.py

from typing import Optional, List
from pydantic import BaseModel, ConfigDict, field_validator, Field
from app.models.measurement_model import UnitCategory

class MeasurementUnitBase(BaseModel):
    name: str
    abbreviation: str
    category: UnitCategory
    is_metric: bool = False
    is_common: bool = True

    model_config = ConfigDict(from_attributes=True)

class MeasurementUnitCreate(MeasurementUnitBase):
    pass

class MeasurementUnit(MeasurementUnitBase):
    id: int


class UnitConversionBase(BaseModel):
    from_unit_id: int
    to_unit_id: int
    ratio: float = Field(gt=0)      # ratio must be positive

    model_config = ConfigDict(
        from_attributes=True,
        arbitrary_types_allowed=True,
        json_schema_serialization_defaults_required=True
    )

    @field_validator('to_unit_id')
    def units_must_be_different(cls, v: int, values: dict) -> int:
        if 'from_unit_id' in values and v == values['from_unit_id']:
            raise ValueError('from_unit and to_unit must be different')
        return v
    
class UnitConversionCreate(UnitConversionBase):
    pass

class UnitConversionResponse(UnitConversionBase):
    id: int
    from_unit: MeasurementUnit
    to_unit: MeasurementUnit

    model_config = ConfigDict(from_attributes=True)