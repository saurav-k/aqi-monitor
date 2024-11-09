import asyncio
import redis
from sqlalchemy.orm import Session
from datetime import datetime
from models import AQIReading, ZPHS01BReading

# Initialize Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Cache keys for specific queries
AQI_CACHE_KEY_5000 = "aqi_data_cache_5000"
ZPHS01B_CACHE_KEY_5000 = "zphs01b_data_cache_5000"
ZPHS01B_CACHE_KEY_3 = "zphs01b_data_cache_3"
CACHE_LIMIT = 20000  # Limit to the last 20,000 records

# Function to fetch and update cache incrementally
def update_cache_incrementally(db: Session, cache_key: str, model, limit):
    # Get the latest timestamp from the cache
    cached_data = redis_client.get(cache_key)
    if cached_data:
        data = eval(cached_data)
        last_timestamp = max(item['timestamp'] for item in data) if data else datetime.min
    else:
        data = []
        last_timestamp = datetime.min

    # Fetch new data from the database
    new_data_query = db.query(model).filter(model.timestamp > last_timestamp).order_by(model.timestamp.desc()).limit(limit)
    new_data = new_data_query.all()

    if new_data:
        # Serialize and append new data to the cache
        new_data = [item.__dict__ for item in new_data]  # Convert to dictionary
        data.extend(new_data)

        # Truncate the cache to keep only the most recent CACHE_LIMIT records
        if len(data) > CACHE_LIMIT:
            data = data[-CACHE_LIMIT:]

        # Update the cache
        redis_client.set(cache_key, str(data))

# Function to get data from cache
def get_cached_data(cache_key):
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return eval(cached_data)  # Deserialize data
    return None

# Background task to update cache frequently
async def poll_database(get_db, AQIReading, ZPHS01BReading):
    while True:
        db = next(get_db())

        # Update cache incrementally for both tables
        update_cache_incrementally(db, AQI_CACHE_KEY_5000, AQIReading, 5000)
        update_cache_incrementally(db, ZPHS01B_CACHE_KEY_5000, ZPHS01BReading, 5000)
        update_cache_incrementally(db, ZPHS01B_CACHE_KEY_3, ZPHS01BReading, 3)

        # Sleep for 1 minute before polling again
        await asyncio.sleep(60)
