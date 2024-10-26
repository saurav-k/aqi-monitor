-- up
CREATE SCHEMA IF NOT EXISTS aqi_data;

CREATE TABLE IF NOT EXISTS aqi_data.aqi_readings (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL,
    pm25 REAL NOT NULL,
    pm10 REAL NOT NULL,
    aqi_pm25 INTEGER NOT NULL,
    aqi_pm10 INTEGER NOT NULL,
    overall_aqi INTEGER NOT NULL
);

-- down
DROP TABLE IF EXISTS aqi_data.aqi_readings;
DROP SCHEMA IF EXISTS aqi_data;
