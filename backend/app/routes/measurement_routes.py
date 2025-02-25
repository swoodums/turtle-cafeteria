# backend/app/route/measurement_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.schemas import measurement_schema
from app.models.measurement_model import MeasurementUnit, UnitCategory, UnitConversion
from app.database import get_db

router = APIRouter(
    prefix="/units",
    tags=["Measurement Units"]
)

@router.get(
    "/",
    response_model=List[measurement_schema.MeasurementUnit],
)
def get_measurement_units(
    category: Optional[UnitCategory] = None,
    is_metric: Optional[bool] = None,
    is_common: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Gets measurement units with optional filtering.
    """
    query = db.query(MeasurementUnit)

    if category:
        query = query.filter(MeasurementUnit.category == category)
    if is_metric is not None:
        query = query.filter(MeasurementUnit.is_metric == is_metric)
    if is_common is not None:
        query = query.filter(MeasurementUnit.is_common == is_common)
    
    return query.all()



@router.get(
    "/{unit_id}",
    response_model=measurement_schema.MeasurementUnit
)
def get_measurement_unit(
    unit_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific measurement unit by ID
    """
    unit = db.query(MeasurementUnit).filter(
        MeasurementUnit.id == unit_id
    ).first()
    if unit is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Measurement unit with id {unit_id} not found"
        )
    return unit