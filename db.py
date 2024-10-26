# db.py

import psycopg2
from yoyo import read_migrations, get_backend
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'dbname': 'aqi_data',
    'user': 'pi_user',
    'password': 'pi_password',
    'host': 'localhost',
    'port': '5432'
}

# Connection string for Yoyo migrations
DB_URL = f"postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['dbname']}"

def get_db_connection():
    """Initialize and return a database connection."""
    try:
        connection = psycopg2.connect(**DB_CONFIG)
        return connection
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def apply_migrations():
    """Apply all migrations from the migrations folder."""
    backend = get_backend(DB_URL)
    migrations = read_migrations("migrations")
    with backend.lock():
        backend.apply_migrations(migrations)
    print("Migrations applied successfully.")

def insert_aqi_data(pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi):
    """Insert AQI data into the aqi_readings table."""
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to the database.")
        return

    try:
        cursor = connection.cursor()

        # SQL query to insert AQI data
        insert_query = """
        INSERT INTO aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        timestamp = datetime.now()
        cursor.execute(insert_query, (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi))
        connection.commit()

        print(f"Data inserted at {timestamp}: PM2.5={pm25}, PM10={pm10}, AQI (PM2.5)={aqi_pm25}, AQI (PM10)={aqi_pm10}, Overall AQI={overall_aqi}")

    except Exception as e:
        print(f"Error inserting data: {e}")
    finally:
        cursor.close()
        connection.close()
