import asyncio
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import endpoints
from db import Base, engine, get_db
from models import AQIReading
from sqlalchemy.orm import Session

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Register API endpoints
app.include_router(endpoints.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify allowed origins here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Slack Webhook URLs
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"
SLACK_INFO_WEBHOOK_URL = "https://hooks.slack.com/services/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"

async def monitor_aqi():
    while True:
        with next(get_db()) as db:  # Get a database session
            check_aqi_readings(db)
        await asyncio.sleep(60)  # Wait for 60 seconds

def check_aqi_readings(db: Session):
    try:
        # Query the last 5 AQI readings ordered by timestamp
        recent_readings = db.query(AQIReading).order_by(AQIReading.timestamp.desc()).limit(5).all()
        
        
        # Calculate average if there are enough readings
        if len(recent_readings) == 5:
            avg_pm2_5 = sum(reading.aqi_pm25 for reading in recent_readings) / 5
            avg_pm10 = sum(reading.aqi_pm10 for reading in recent_readings) / 5
            avg_overall_aqi = (avg_pm2_5 + avg_pm10) / 2
        
            
            if avg_overall_aqi > 145:
                send_high_alert_to_slack(avg_overall_aqi)
            else:
                send_info_alert_to_slack(avg_overall_aqi)
                
    except Exception as e:
        print(f"Error in monitoring AQI data: {e}")

def send_info_alert_to_slack(avg_overall_aqi):
    # Prepare the message payload
    message_payload = {
        "text": (
            f"Info:  AQI levels detected!\n"
            f"- avg_overall_aqi: {avg_overall_aqi}\n"
            "Please relax."
        )
    }
    
    # Send the alert to Slack
    try:
        response = requests.post(SLACK_INFO_WEBHOOK_URL, json=message_payload)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as error:
        print(f"Failed to send info alert to Slack: {error}")
        
def send_high_alert_to_slack(avg_overall_aqi):
    message = {
        "text": (
            f"⚠️ Alert: High AQI levels detected!\n"
            f"- avg_overall_aqi: {avg_overall_aqi}\n"
            "Take necessary actions."
        )
    }
    
    try:
        response = requests.post(SLACK_WEBHOOK_URL, json=message)
        response.raise_for_status()  # Raise an error for bad status codes
    except requests.exceptions.RequestException as error:
        print(f"Failed to send high alert to Slack: {error}")

@app.on_event("startup")
async def startup_event():
    # Start the monitoring task as a background task without lifespan
    asyncio.create_task(monitor_aqi())
