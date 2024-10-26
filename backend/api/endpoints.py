from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db import get_db
from models import AQIReading
from schemas import AQIReadingResponse
from typing import List

router = APIRouter()

@router.get("/aqi_data", response_model=List[AQIReadingResponse])
def get_aqi_data(db: Session = Depends(get_db), limit: int = 100):
    data = db.query(AQIReading).order_by(AQIReading.timestamp.desc()).limit(limit).all()
    return data
