from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db import get_db
from models import AQIReading, TrackingEvent, ZPHS01BReading
from schemas import AQIReadingResponse, TrackingEventRequest, ZPHS01BReadingResponse
from typing import List, Optional
from datetime import datetime
from cache_manager import cache_manager

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
            
        # Then apply limit and offset
        # Try to get data from cache
        cached_data = cache_manager.get_cached_data(cache_manager.AQI_CACHE_KEY)
        if cached_data:
            # Slice the cached data to serve the requested limit and offset
            return cached_data[offset:offset + limit]
        else:

            # If cache is not available, fall back to querying the database
            query = db.query(AQIReading).order_by(AQIReading.timestamp.desc())

            # Apply time range filters
            if start_time and end_time:
                query = query.filter(and_(AQIReading.timestamp >= start_time, AQIReading.timestamp <= end_time))
            elif start_time:
                query = query.filter(AQIReading.timestamp >= start_time)
            elif end_time:
                query = query.filter(AQIReading.timestamp <= end_time)
                
            # Then apply limit and offset
            query = query.offset(offset).limit(limit)
            
            data = query.all()
            
            if not data:
                raise HTTPException(status_code=404, detail="No AQI readings found")
            
            return data
    except Exception as e:
        # Log error and return a readable response
        print(f"Error fetching AQI data: {e}")
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
        return {"message": "Event tracked successfully"}
    except Exception as e:
        print(f"Error tracking event: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@router.get("/zphs01b_data", response_model=List[ZPHS01BReadingResponse])
def get_zphs01b_data(
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
            
        # Then apply limit and offset
        # Try to get data from cache
        cached_data = cache_manager.get_cached_data(cache_manager.ZPHS01B_CACHE_KEY)
        if cached_data:
            # Slice the cached data to serve the requested limit and offset
            return cached_data[offset:offset + limit]
        else:
            # If cache is not available, fall back to querying the database
            query = db.query(ZPHS01BReading).order_by(ZPHS01BReading.timestamp.desc())

            # Apply time range filters
            if start_time and end_time:
                query = query.filter(and_(ZPHS01BReading.timestamp >= start_time, ZPHS01BReading.timestamp <= end_time))
            elif start_time:
                query = query.filter(ZPHS01BReading.timestamp >= start_time)
            elif end_time:
                query = query.filter(ZPHS01BReading.timestamp <= end_time)
                

            query = query.offset(offset).limit(limit)
            
            data = query.all()
            
            if not data:
                raise HTTPException(status_code=404, detail="No ZPHS01B readings found")
            
            return data
    except Exception as e:
        print(f"Error fetching ZPHS01B data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
