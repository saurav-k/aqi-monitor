import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime, timedelta, timezone
from db import get_db, execute_weather_analysis_query
from models import AQIReading, TrackingEvent, ZPHS01BReading, WeatherData
from schemas import AQIReadingResponse, TrackingEventRequest, ZPHS01BReadingResponse, WeatherDataResponse, WeatherDataAnalysisResponse
from typing import List, Optional
from datetime import datetime
from cache_manager import cache_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/aqi_data", response_model=List[AQIReadingResponse])
def get_aqi_data(
    limit: int = Query(100, gt=0, le=20000),  # Limit between 1 and 20,000
    offset: int = Query(0, ge=0),  # Offset for pagination
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Cap the limit to a maximum of 10,000
        if limit > 10000:
            limit = 10000

        # Try to get data from cache
        # cached_data = cache_manager.get_cached_data(cache_manager.AQI_CACHE_KEY)
        # if cached_data:
        #     # Log that data is being served from the cache
        #     logger.info("Serving AQI data from cache")
        #     # Slice the cached data to serve the requested limit and offset
        #     return cached_data[offset:offset + limit]

        # Log that data is being fetched from the database
        logger.info("Cache miss - querying database for AQI data")

        # If cache is not available, fall back to querying the database
        query = db.query(AQIReading).order_by(AQIReading.timestamp.desc())

        # Apply time range filters
        if start_time and end_time:
            query = query.filter(and_(AQIReading.timestamp >= start_time, AQIReading.timestamp <= end_time))
        elif start_time:
            query = query.filter(AQIReading.timestamp >= start_time)
        elif end_time:
            query = query.filter(AQIReading.timestamp <= end_time)

        # Apply limit and offset
        query = query.offset(offset).limit(limit)
        data = query.all()

        if not data:
            raise HTTPException(status_code=404, detail="No AQI readings found")

        # Update the cache with the fetched data
        logger.info(f"Updating cache {cache_manager.AQI_CACHE_KEY}")
        # cache_manager.update_cache(cache_manager.AQI_CACHE_KEY, data)
        logger.info("Updated AQI data cache after database query")

        return data
    except Exception as e:
        # Log error and return a readable response
        logger.error(f"Error fetching AQI data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/track_event")
async def track_event(event: TrackingEventRequest, request: Request, db: Session = Depends(get_db)):
    try:
        # Use the IP from the request if not provided in the payload
        ip_address = event.ip_address or request.headers.get("X-Forwarded-For", request.client.host).split(",")[0].strip()

        tracking_event = TrackingEvent(
            event_type=event.event_type,
            timestamp=datetime.utcnow(),
            ip_address=ip_address,
            details=event.details
        )

        db.add(tracking_event)
        db.commit()
        logger.info(f"Tracked event: {event.event_type} from IP {ip_address}")
        return {"message": "Event tracked successfully"}
    except Exception as e:
        logger.error(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/zphs01b_data", response_model=List[ZPHS01BReadingResponse])
def get_zphs01b_data(
    limit: Optional[int] = Query(None, gt=0, le=20000),  # No default limit
    offset: int = Query(0, ge=0),
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        limit = 10000
        # Log that data is being fetched from the database
        logger.info("Cache miss - querying database for ZPHS01B data")

        # Query to fetch data from the database
        query = db.query(ZPHS01BReading).order_by(ZPHS01BReading.timestamp.desc())

        # Apply time range filters
        if start_time and end_time:
            query = query.filter(and_(ZPHS01BReading.timestamp >= start_time, ZPHS01BReading.timestamp <= end_time))
        elif start_time:
            query = query.filter(ZPHS01BReading.timestamp >= start_time)
        elif end_time:
            query = query.filter(ZPHS01BReading.timestamp <= end_time)

        # Apply limit and offset only if limit is provided
        if limit:
            query = query.offset(offset).limit(limit)
        else:
            query = query.offset(offset)  # Apply only offset if limit is not specified

        data = query.all()

        if not data:
            raise HTTPException(status_code=404, detail="No ZPHS01B readings found")

        # Update the cache with the fetched data
        logger.info(f"Updating cache {cache_manager.ZPHS01B_CACHE_KEY}")
        # cache_manager.update_cache(cache_manager.ZPHS01B_CACHE_KEY, data)
        logger.info("Updated ZPHS01B data cache after database query")

        return data
    except Exception as e:
        # Log error and return a readable response
        logger.error(f"Error fetching ZPHS01B data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/weather_data", response_model=List[WeatherDataResponse])
def get_weather_data(
    limit: int = Query(100, gt=0, le=20000),  # Limit between 1 and 20,000
    offset: int = Query(0, ge=0),  # Offset for pagination
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Cap the limit to a maximum of 10,000
        if limit > 10000:
            limit = 10000

        # Query the weather_data table
        query = db.query(WeatherData).order_by(WeatherData.timestamp.desc())

        # Apply time range filters
        if start_time and end_time:
            query = query.filter(WeatherData.timestamp.between(start_time, end_time))
        elif start_time:
            query = query.filter(WeatherData.timestamp >= start_time)
        elif end_time:
            query = query.filter(WeatherData.timestamp <= end_time)

        # Apply limit and offset
        query = query.offset(offset).limit(limit)
        data = query.all()

        if not data:
            raise HTTPException(status_code=404, detail="No weather data found")

        return data
    except Exception as e:
        # Log error and return a readable response
        logger.error(f"Error fetching weather data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    

@router.get("/weather_data_analysis", response_model=List[WeatherDataAnalysisResponse])
def fetch_weather_data_analysis(
    start_time: Optional[datetime] = Query(None, description="Start time for the query in ISO format"),
    end_time: Optional[datetime] = Query(None, description="End time for the query in ISO format"),
    db: Session = Depends(get_db)
):
    try:
        # Default to timezone-aware current time and -60 minutes if no input is provided
        if not end_time:
            end_time = datetime.now(timezone.utc) + timedelta(hours= 5 , minutes=60) 
        if not start_time:
            start_time = end_time - timedelta(minutes=60)

        # Validation: Ensure start_time is before end_time
        if start_time >= end_time:
            raise HTTPException(
                status_code=400,
                detail="start_time must be earlier than end_time"
            )

        # Execute the query
        data = execute_weather_analysis_query(db, start_time, end_time)
        if not data:
            raise HTTPException(status_code=404, detail="No weather data found")
        
        # Map query result to response model
        response = [
            WeatherDataAnalysisResponse(
                start_time=row[0],
                end_time=row[1],
                wind_direction_readable=row[2],
                data_point_count=row[3],
                percentage=row[4],
                avg_wind_speed_kmh=row[5],
                avg_angle=row[6],
            )
            for row in data
        ]
        return response
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))