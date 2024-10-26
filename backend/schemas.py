# schemas.py
from pydantic import BaseModel
from datetime import datetime

class AQIReadingResponse(BaseModel):
    timestamp: datetime
    pm25: float
    pm10: float

    class Config:
        orm_mode = True
