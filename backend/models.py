# models.py
from sqlalchemy import Column, Integer, Float, TIMESTAMP, String, DateTime, JSON
from datetime import datetime
from db import Base

class AQIReading(Base):
    __tablename__ = "aqi_readings"
    __table_args__ = {"schema": "aqi_data"}

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(TIMESTAMP, nullable=False)
    pm25 = Column(Float, nullable=False)
    pm10 = Column(Float, nullable=False)
    aqi_pm25 = Column(Integer, nullable=False)
    aqi_pm10 = Column(Integer, nullable=False)
    overall_aqi = Column(Integer, nullable=False)


class RequestLog(Base):
    __tablename__ = "request_logs"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    endpoint = Column(String)
    method = Column(String)
    
class TrackingEvent(Base):
    __tablename__ = "tracking_events"
    __table_args__ = {"schema": "aqi_data"}

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    ip_address = Column(String(45))  # Supports both IPv4 and IPv6 addresses
    details = Column(JSON, nullable=True)