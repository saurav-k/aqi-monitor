import os
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from sqlalchemy.orm import Session
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Read DATABASE_URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Set up SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def execute_weather_analysis_query(db: Session, start_time: datetime, end_time: datetime):
    """
    Executes the weather analysis query with start_time and end_time as inputs.
    """
    query = text("""
    WITH timestamp_value AS (
        SELECT :start_time AS start_time, :end_time AS end_time
    ),
    weather_data_analysis AS (
        SELECT 
            tv.start_time,
            tv.end_time,
            wd."timestamp",
            (wd.wind_speed * 3.6) AS wind_speed,
            wd.wind_direction,
            CASE
                WHEN wd.wind_direction >= 350 OR wd.wind_direction < 10 THEN 'Wind Coming from N'
                WHEN wd.wind_direction >= 10 AND wd.wind_direction < 30 THEN 'Wind Coming from NNE'
                WHEN wd.wind_direction >= 30 AND wd.wind_direction < 50 THEN 'Wind Coming from NE'
                WHEN wd.wind_direction >= 50 AND wd.wind_direction < 70 THEN 'Wind Coming from ENE'
                WHEN wd.wind_direction >= 70 AND wd.wind_direction < 90 THEN 'Wind Coming from E'
                WHEN wd.wind_direction >= 90 AND wd.wind_direction < 110 THEN 'Wind Coming from ESE'
                WHEN wd.wind_direction >= 110 AND wd.wind_direction < 130 THEN 'Wind Coming from SE'
                WHEN wd.wind_direction >= 130 AND wd.wind_direction < 150 THEN 'Wind Coming from SSE'
                WHEN wd.wind_direction >= 150 AND wd.wind_direction < 170 THEN 'Wind Coming from S'
                WHEN wd.wind_direction >= 170 AND wd.wind_direction < 190 THEN 'Wind Coming from SSW'
                WHEN wd.wind_direction >= 190 AND wd.wind_direction < 210 THEN 'Wind Coming from SW'
                WHEN wd.wind_direction >= 210 AND wd.wind_direction < 230 THEN 'Wind Coming from WSW'
                WHEN wd.wind_direction >= 230 AND wd.wind_direction < 250 THEN 'Wind Coming from W'
                WHEN wd.wind_direction >= 250 AND wd.wind_direction < 270 THEN 'Wind Coming from WNW'
                WHEN wd.wind_direction >= 270 AND wd.wind_direction < 290 THEN 'Wind Coming from NW'
                WHEN wd.wind_direction >= 290 AND wd.wind_direction < 310 THEN 'Wind Coming from NNW'
                WHEN wd.wind_direction >= 310 AND wd.wind_direction < 330 THEN 'Wind Coming from N/NW'
                WHEN wd.wind_direction >= 330 AND wd.wind_direction < 350 THEN 'Wind Coming from N/NNE'
                ELSE 'Unknown Wind Direction'
            END AS wind_direction_readable
        FROM 
            timestamp_value tv
        JOIN 
            aqi_data.weather_data wd
        ON 
            wd."timestamp" BETWEEN tv.start_time AND tv.end_time
    ),
    ranked_weather_data AS (
        SELECT 
            start_time,
            end_time,
            wind_direction_readable,
            COUNT(*) AS data_point_count,
            AVG(wind_speed) AS avg_wind_speed_kmh,
            SUM(COS(RADIANS(wd.wind_direction))) AS sum_cos,
            SUM(SIN(RADIANS(wd.wind_direction))) AS sum_sin
        FROM 
            weather_data_analysis wd
        GROUP BY 
            start_time, end_time, wind_direction_readable
    ),
    total_data_points AS (
        SELECT 
            SUM(data_point_count) AS total_points
        FROM 
            ranked_weather_data
    )
    SELECT 
        start_time,
        end_time,
        COALESCE(wind_direction_readable, 'Overall Average') AS wind_direction_readable,
        SUM(data_point_count) AS data_point_count,
        ROUND((SUM(data_point_count) * 100.0 / (SELECT total_points FROM total_data_points)), 2) AS percentage,
        AVG(avg_wind_speed_kmh) AS avg_wind_speed_kmh,
        DEGREES(ATAN2(
            SUM(data_point_count * sum_sin) / SUM(data_point_count),
            SUM(data_point_count * sum_cos) / SUM(data_point_count)
        )) AS avg_angle
    FROM 
        ranked_weather_data, total_data_points
    GROUP BY 
        GROUPING SETS (
            (start_time, end_time, wind_direction_readable),
            ()
        )
    ORDER BY 
        start_time DESC NULLS LAST, data_point_count DESC;
    """)
    try:
        # Execute the query with parameterized inputs
        result = db.execute(query, {"start_time": start_time, "end_time": end_time}).fetchall()
        return result
    except SQLAlchemyError as e:
        raise RuntimeError(f"Database query failed: {str(e)}")