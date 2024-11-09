import asyncio
import os
from dotenv import load_dotenv
import requests
from fastapi import FastAPI, Request, Depends, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from api import endpoints
from db import Base, engine, get_db
from models import AQIReading, ZPHS01BReading
from sqlalchemy.orm import Session
from models import RequestLog
from datetime import datetime, timedelta
from cache_manager import cache_manager

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Define an API key header dependency
API_KEY = "your-secure-api-key"
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    if api_key != API_KEY:
        raise HTTPException(
            status_code=403,
            detail="Could not validate credentials"
        )
    return api_key

@app.middleware("http")
async def log_request_ip(request: Request, call_next):
    response = await call_next(request)

    # Extract the client's IP address
    client_ip = request.headers.get("X-Forwarded-For", request.client.host).split(",")[0].strip()
    endpoint = request.url.path
    method = request.method

    # Save the IP address, endpoint, and method in the database
    with next(get_db()) as db:
        new_log = RequestLog(ip_address=client_ip, timestamp=datetime.utcnow(), endpoint=endpoint, method=method)
        db.add(new_log)
        db.commit()

    return response

# Event to run both background tasks on startup
@app.on_event("startup")
async def startup_event():
    # Start the first background task
    asyncio.create_task(monitor_aqi())
    
    # Start the second background task (polling the database)
    asyncio.create_task(cache_manager.poll_database(get_db, AQIReading, ZPHS01BReading))

# Register API endpoints
app.include_router(endpoints.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify allowed origins here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load environment variables from .env file
load_dotenv()

# Slack Webhook URLs
SLACK_HIGH_ALERT_WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")
SLACK_INFO_WEBHOOK_URL = os.getenv("SLACK_INFO_WEBHOOK_URL")
SLACK_VOC_WEBHOOK_URL = os.getenv("SLACK_VOC_WEBHOOK_URL")

# Dictionary to track the last alert timestamps
last_alert_time = {
    "aqi_high": None,
    "aqi_info": None,
    "voc_high": None,
    "voc_warning": None,
    "voc_info": None
}

# Helper function to check if 20 minutes have passed
def can_send_alert(alert_type):
    now = datetime.utcnow()
    last_time = last_alert_time.get(alert_type)
    if last_time is None or (now - last_time) > timedelta(minutes=20):
        last_alert_time[alert_type] = now
        return True
    return False

async def monitor_aqi():
    while True:
        with next(get_db()) as db:  # Get a database session
            check_aqi_readings(db)
        await asyncio.sleep(150)  # Wait for 150 seconds (2.5 minutes)

def check_aqi_readings(db: Session):
    try:
        # Query the last 5 AQI readings ordered by timestamp
        recent_readings = db.query(AQIReading).order_by(AQIReading.timestamp.desc()).limit(5).all()

        # Query the last 5 VOC readings ordered by timestamp
        recent_voc_readings = db.query(ZPHS01BReading).order_by(ZPHS01BReading.timestamp.desc()).limit(5).all()

        # Calculate average AQI if there are enough readings
        if len(recent_readings) == 5:
            avg_pm2_5 = round(sum(reading.aqi_pm25 for reading in recent_readings) / 5, 2)
            avg_pm10 = round(sum(reading.aqi_pm10 for reading in recent_readings) / 5, 2)
            avg_overall_aqi = round((avg_pm2_5 + avg_pm10) / 2, 2)
            avg_pm2_5_raw = round(sum(reading.pm25 for reading in recent_readings) / 5, 2)
            avg_pm10_raw = round(sum(reading.pm10 for reading in recent_readings) / 5, 2)

            if avg_overall_aqi > 200 and can_send_alert("aqi_high"):
                send_high_alert_to_slack(avg_overall_aqi, avg_pm2_5_raw, avg_pm10_raw)
            elif can_send_alert("aqi_info"):
                send_info_alert_to_slack(avg_overall_aqi, avg_pm2_5_raw, avg_pm10_raw)

        # Calculate average VOC if there are enough readings
        if len(recent_voc_readings) == 5:
            avg_voc = round(sum(reading.voc for reading in recent_voc_readings) / 5, 2)

            if avg_voc >= 3 and can_send_alert("voc_high"):
                send_voc_alert_to_slack(avg_voc, "high")
            elif avg_voc >= 2 and can_send_alert("voc_warning"):
                send_voc_alert_to_slack(avg_voc, "warning")
            elif avg_voc >= 1 and can_send_alert("voc_info"):
                send_voc_alert_to_slack(avg_voc, "info")
    
    except Exception as e:
        print(f"Error in monitoring AQI and VOC data: {e}")

def send_info_alert_to_slack(avg_overall_aqi, avg_pm2_5, avg_pm10):
    # Prepare the message payload
    message_payload = {
        "text": (
            f"Info: AQI levels detected! "
            f"- avg_overall_aqi: {avg_overall_aqi} and "
            f"- avg_pm2_5: {avg_pm2_5} µg/m³ "
            f"- avg_pm10: {avg_pm10} µg/m³ "
            "Please relax."
        )
    }
    
    # Send the alert to Slack
    try:
        response = requests.post(SLACK_INFO_WEBHOOK_URL, json=message_payload)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as error:
        print(f"Failed to send info alert to Slack: {error}")

def send_voc_alert_to_slack(voc_value, alert_level):
    # Determine the message based on the alert level
    if alert_level == "high":
        alert_message = (
            f"@channel 🚨 *High VOC Alert:* "
            f"VOC levels are critically high! "
            f"- *VOC Value*: {voc_value} "
            "Immediate action is required!"
        )
    elif alert_level == "warning":
        alert_message = (
            f"⚠️ *Warning: Elevated VOC Levels* "
            f"- *VOC Value*: {voc_value} "
            "Please monitor the situation closely."
        )
    elif alert_level == "info":  # "info" level
        alert_message = (
            f"ℹ️ *Info: VOC Levels Above Normal* "
            f"- *VOC Value*: {voc_value} "
            "Stay cautious and ensure ventilation."
        )
    
    # Prepare the Slack message payload
    message_payload = {
        "text": alert_message
    }
    
    # Send the VOC alert to Slack
    try:
        response = requests.post(SLACK_VOC_WEBHOOK_URL, json=message_payload)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as error:
        print(f"Failed to send VOC alert to Slack: {error}")

def send_high_alert_to_slack(avg_overall_aqi, avg_pm2_5, avg_pm10):
    # Prepare the message payload with mention to @channel for alert sound
    message_payload = {
        "text": (
            f"@channel ⚠️ *ALERT: High AQI levels detected!* "
            f"- *Average Overall AQI*: {avg_overall_aqi} and "
            f"- avg_pm2_5: {avg_pm2_5} µg/m³ "
            f"- avg_pm10: {avg_pm10} µg/m³ "
            "*Immediate action required!*"
        ),
        "blocks": [
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": (
                        f"@channel ⚠️ *ALERT: High AQI levels detected!*\n"
                        f"- *Average Overall AQI*: {avg_overall_aqi} \n"
                        f"- avg_pm2_5: {avg_pm2_5} µg/m³\n"
                        f"- avg_pm10: {avg_pm10} µg/m³\n"
                        "*Immediate action required!*"
                    )
                }
            }
        ]
    }

    # Send the alert to Slack
    try:
        response = requests.post(SLACK_HIGH_ALERT_WEBHOOK_URL, json=message_payload)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as error:
        print(f"Failed to send high alert to Slack: {error}")

