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
        
class ZPHS01BReadingResponse(BaseModel):
    timestamp: datetime
    pm1_0: float
    pm2_5: float
    pm10: float
    co2: float
    voc: int
    temperature: float
    humidity: float
    ch2o: float
    co: float
    o3: float
    no2: float
    aqi_pm2_5: float
    aqi_pm10: float
    aqi_co: Optional[float] = None
    aqi_o3: Optional[float] = None
    aqi_no2: Optional[float] = None
    overall_aqi: float

    class Config:
        from_attributes = True  # Updated for Pydantic v2
        
class WeatherDataResponse(BaseModel):
    timestamp: datetime
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    wind_speed: Optional[float] = None
    wind_direction: Optional[float] = None
    rain_intensity: Optional[float] = None
    rain_accumulation: Optional[float] = None
    city_name: Optional[str] = None
    locality_name: Optional[str] = None

    class Config:
        from_attributes = True  # Updated for Pydantic v2