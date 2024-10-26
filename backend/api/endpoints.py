from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db import get_db
from models import AQIReading
from schemas import AQIReadingResponse
from typing import List

router = APIRouter()

@router.get("/aqi_data", response_model=List[AQIReadingResponse])
def get_aqi_data(limit: int = Query(100, gt=0), db: Session = Depends(get_db)):
    """
    Retrieve AQI data with a specified limit.

    Parameters:
    - limit (int): The maximum number of AQI readings to return. Defaults to 100.

    Returns:
    - List[AQIReadingResponse]: The requested AQI readings.
    
    /aqi_data?limit=50
    """
    data = db.query(AQIReading).order_by(AQIReading.timestamp.desc()).limit(limit).all()
    return data
