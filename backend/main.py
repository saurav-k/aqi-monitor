# main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db import get_db, Base, engine
import models
import schemas

# Create the database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/api/aqi-data", response_model=list[schemas.AQIReadingResponse])
def get_aqi_data(db: Session = Depends(get_db), limit: int = 100):
    """
    Fetch AQI data with timestamps, PM2.5, and PM10 values.
    """
    readings = db.query(models.AQIReading).order_by(models.AQIReading.timestamp.desc()).limit(limit).all()
    return readings
