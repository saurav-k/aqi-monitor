# schemas.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict

class AQIReadingResponse(BaseModel):
    timestamp: datetime
    pm25        : float
    pm10        : float
    aqi_pm25    : float
    aqi_pm10    : float
    overall_aqi : float

    class Config:
        from_attributes = True  # Updated for Pydantic v2

class TrackingEventRequest(BaseModel):
    event_type: str
    ip_address: Optional[str] = None
    details: Optional[Dict] = None

    class Config:
        from_attributes = True