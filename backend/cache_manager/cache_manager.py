import asyncio
import logging
import json
import redis
from sqlalchemy.orm import Session
from datetime import datetime
from models import AQIReading, ZPHS01BReading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Redis
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Cache keys for specific queries
AQI_CACHE_KEY = "aqi_data_cache"
ZPHS01B_CACHE_KEY = "zphs01b_data_cache"
CACHE_LIMIT = 20000  # Limit to the last 20,000 records

# Helper function to convert SQLAlchemy objects to dictionaries
def serialize_sqlalchemy_object(obj):
    """
    Convert a SQLAlchemy model instance into a dictionary, excluding non-serializable fields.
    """
    # Use the object's __dict__ attribute but exclude internal SQLAlchemy attributes and methods
    serialized_data = {}
    for key, value in obj.__dict__.items():
        if not key.startswith('_'):  # Exclude private attributes
            if isinstance(value, datetime):  # Convert datetime objects to strings
                serialized_data[key] = value.isoformat()
            else:
                serialized_data[key] = value
    return serialized_data

# Function to fetch and update cache incrementally
def update_cache_incrementally(db: Session, cache_key: str, model, limit):
    # Get the latest timestamp from the cache
    cached_data = redis_client.get(cache_key)
    if cached_data:
        try:
            data = json.loads(cached_data)  # Use json.loads() for deserialization
        except json.JSONDecodeError:
            data = []  # If deserialization fails, reset to an empty list
        last_timestamp = max(
            datetime.fromisoformat(item['timestamp']) for item in data if 'timestamp' in item
        ) if data else datetime.min
    else:
        data = []
        last_timestamp = datetime.min

    # Fetch new data from the database
    new_data_query = (
        db.query(model)
        .filter(model.timestamp > last_timestamp)
        .order_by(model.timestamp.desc())
        .limit(limit)
    )
    new_data = new_data_query.all()
    logger.info(f"new data {new_data} for cache_key :- {cache_key} at {datetime.now()}")
    
    # Log the deserialized new data (consider logging only a sample if the data is large)
    logger.info(f"if no new data Deserialized new data sample (first 5 records) for cache_key: {cache_key} at {datetime.now()} - {json.dumps(deserialized_new_data[:5], indent=2)}")
    
    
    if new_data:
        # Serialize new data and append to the cache
        new_data_dicts = [serialize_sqlalchemy_object(item) for item in new_data]
        data.extend(new_data_dicts)
            # Deserialize new_data into a list of dictionaries for logging
        deserialized_new_data = [serialize_sqlalchemy_object(item) for item in new_data]

        # Log the deserialized new data (consider logging only a sample if the data is large)
        logger.info(f"Deserialized new data sample (first 5 records) for cache_key: {cache_key} at {datetime.now()} - {json.dumps(deserialized_new_data[:5], indent=2)}")
    

        # Log the top 5 items in the `data` list after extending
        logger.info(f"before trim Top 5 items in cache after extending for cache_key: {cache_key} at {datetime.now()} - {json.dumps(data[:5], indent=2)}")

        # Truncate the cache to keep only the most recent CACHE_LIMIT records
        if len(data) > CACHE_LIMIT:
            data = data[-CACHE_LIMIT:]
            
        # Log the top 5 items in the `data` list after extending
        logger.info(f"Top 5 items in cache after extending for cache_key: {cache_key} at {datetime.now()} - {json.dumps(data[:5], indent=2)}")


        # Update the cache
        redis_client.set(cache_key, json.dumps(data))  # Use json.dumps() for serialization
        logger.info(f"update cache_key :- {cache_key} at {datetime.now()}")

# Function to get cached data
def get_cached_data(cache_key):
    cached_data = redis_client.get(cache_key)
    if cached_data:
        try:
            return json.loads(cached_data)  # Use json.loads() for deserialization
        except json.JSONDecodeError:
            return None  # Return None if deserialization fails
    return None

# Function to update cache
def update_cache(cache_key, data):
    # Convert objects to dictionaries and serialize using json
    serialized_data = json.dumps([serialize_sqlalchemy_object(item) for item in data])
    redis_client.set(cache_key, serialized_data)

# Background task to update cache frequently
async def poll_database(get_db, AQIReading, ZPHS01BReading):
    while True:
        db = next(get_db())

        # Update cache incrementally for both tables
        update_cache_incrementally(db, AQI_CACHE_KEY, AQIReading, 5000)
        update_cache_incrementally(db, ZPHS01B_CACHE_KEY, ZPHS01BReading, 5000)

        # Sleep for 1 minute before polling again
        await asyncio.sleep(60)
