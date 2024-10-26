# schemas.py
from pydantic import BaseModel
from datetime import datetime

class AQIReadingResponse(BaseModel):
    timestamp: datetime
    pm25        : float
    pm10        : float
    aqi_pm25    : float
    aqi_pm10    : float
    overall_aqi : float

    class Config:
        from_attributes = True  # Updated for Pydantic v2
