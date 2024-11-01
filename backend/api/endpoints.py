from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import and_
from db import get_db
from models import AQIReading, TrackingEvent
from schemas import AQIReadingResponse, TrackingEventRequest
from typing import List, Optional
from datetime import datetime

router = APIRouter()

@router.get("/aqi_data", response_model=List[AQIReadingResponse])
def get_aqi_data(
    limit: int = Query(100, gt=0),
    offset: int = Query(0, ge=0),
    start_time: Optional[datetime] = Query(None),
    end_time: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    try:
        # Begin the query without limit or offset
        query = db.query(AQIReading).order_by(AQIReading.timestamp.desc())
        
        # Apply time range filters first
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
            raise HTTPException(status_code=404, detail="No AQI readings found within the specified time range")
        
        return data
    except Exception as e:
        # Log error and return a readable response
        print(f"Error fetching AQI data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/track_event")
async def track_event(event: TrackingEventRequest, request: Request, db: Session = Depends(get_db)):
    try:
        # Use the IP from the request if not provided in the payload
        ip_address = event.ip_address or request.client.host

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