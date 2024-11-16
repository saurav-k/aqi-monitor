# db.py

import sys
import psycopg2
from alembic import command
from alembic.config import Config
from datetime import datetime

# Database configuration
DB_CONFIG = {
    'dbname': 'aqi_data',
    'user': 'pi_user',
    'password': 'pi_password',
    'host': 'localhost',
    'port': '5432'
}

# Connection string for psycopg2
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
    """Apply all migrations using Alembic."""
    alembic_cfg = Config("alembic.ini")
    try:
        # Run Alembic migrations to ensure the database schema is up to date
        command.upgrade(alembic_cfg, "head")
        print("Migrations applied successfully.")
    except Exception as e:
        print(f"Error during migration: {e}")
        sys.exit(1)
        
    # Check if the table exists in the schema after migration
    connection = get_db_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'aqi_data' AND table_name = 'aqi_readings');")
    table_exists = cursor.fetchone()[0]
    cursor.close()
    connection.close()
    
    if table_exists:
        print("Migrations applied and table exists.")
    else:
        print("Migration was applied, but table does not exist.")
        sys.exit(1)

def insert_aqi_data(pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi):
    """Insert AQI data into the aqi_data.aqi_readings table."""
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to the database.")
        return

    try:
        cursor = connection.cursor()

        # SQL query to insert AQI data into the schema-specific table
        insert_query = """
        INSERT INTO aqi_data.aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
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

def insert_zphs01b_data(data):
    """Insert ZPHS01B sensor data into the aqi_data.zphs01b_readings table."""
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to the database.")
        return

    try:
        cursor = connection.cursor()
        # SQL query to insert data into the ZPHS01B-specific table
        insert_query = """
        INSERT INTO aqi_data.zphs01b_readings (
            timestamp, pm1_0, pm2_5, pm10, co2, voc, temperature, humidity, ch2o, co, o3, no2,
            aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2, overall_aqi
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        timestamp = datetime.now()
        cursor.execute(insert_query, (
            timestamp, data['pm1.0'], data['pm2.5'], data['pm10'], data['co2'], data['voc'],
            data['temperature'], data['humidity'], data['ch2o'], data['co'], data['o3'], data['no2'],
            data['aqi_pm2.5'], data['aqi_pm10'], data.get('aqi_co'), data.get('aqi_o3'), data.get('aqi_no2'),
            data['overall_aqi']
        ))
        connection.commit()
        print(f"Data inserted at {timestamp}: {data}")

    except Exception as e:
        print(f"Error inserting data: {e}")
    finally:
        cursor.close()
        connection.close()
        

# Insert weather data into the new table
def insert_weather_data(data):
    """Insert weather data into the weather_data table with hardcoded city and locality."""
    connection = get_db_connection()
    if connection is None:
        print("Failed to connect to the database.")
        return

    try:
        cursor = connection.cursor()
        insert_query = """
        INSERT INTO aqi_data.weather_data (
            timestamp, temperature, humidity, wind_speed, wind_direction,
            rain_intensity, rain_accumulation, city_name, locality_name
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        timestamp = datetime.now()
        cursor.execute(insert_query, (
            timestamp, data.get('temperature'), data.get('humidity'),
            data.get('wind_speed'), data.get('wind_direction'),
            data.get('rain_intensity'), data.get('rain_accumulation'),
            'Hyderabad', 'Patancheru, Hyderabad'  # Hardcoded values for city_name and locality_name
        ))
        connection.commit()
        print(f"Weather data inserted at {timestamp}: {data}")

    except Exception as e:
        print(f"Error inserting weather data: {e}")
    finally:
        cursor.close()
        connection.close()