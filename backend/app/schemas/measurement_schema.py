# backend/app/schemas/measurement_schema.py

from pydantic import BaseModel, ConfigDict, field_validator, Field
from app.models.measurement_model import UnitCategory

class MeasurementUnitBase(BaseModel):
    name: str
    abbreviation: str
    category: UnitCategory
    is_metric: bool = False
    is_common: bool = True

class MeasurementUnitCreate(MeasurementUnitBase):
    pass

class MeasurementUnit(MeasurementUnitBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class UnitConversionBase(BaseModel):
    from_unit_id: int
    to_unit_id: int
    ratio: float = Field(gt=0)      # ratio must be positive

    @field_validator('to_unit_id')
    def units_must_be_different(cls, v: int, values: dict) -> int:
        if 'from_unit_id' in values and v == values['from_unit_id']:
            raise ValueError('from_unit and to_unit must be different')
        return v
    
class UnitConversionCreate(UnitConversionBase):
    pass

class UnitConversion(UnitConversionBase):
    id: int
    from_unit: MeasurementUnit
    to_unit: MeasurementUnit
    model_config = ConfigDict(from_attributes=True)