# main.py
from db import apply_migrations, insert_aqi_data
import time
from sds011 import SDS011

# Initialize SDS011 sensor
SERIAL_PORT = "/dev/ttyUSB0"
sensor = SDS011(SERIAL_PORT, use_query_mode=True)

def get_aqi(pm_value, pollutant_type):
    # Define breakpoints for PM2.5 and PM10 as per Indian AQI standards
    if pollutant_type == "PM2.5":
        breakpoints = [
            (0, 30, 0, 50), (31, 60, 51, 100), (61, 90, 101, 200), 
            (91, 120, 201, 300), (121, 250, 301, 400), (250, 500, 401, 500)
        ]
    elif pollutant_type == "PM10":
        breakpoints = [
            (0, 50, 0, 50), (51, 100, 51, 100), (101, 250, 101, 200), 
            (251, 350, 201, 300), (351, 430, 301, 400), (430, 500, 401, 500)
        ]
    else:
        raise ValueError("Invalid pollutant type. Must be 'PM2.5' or 'PM10'.")

    for (c_low, c_high, i_low, i_high) in breakpoints:
        if c_low <= pm_value <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm_value - c_low) + i_low)
    
    return 500  # Max AQI value if out of range


def get_sensor_data():
    """Fetch data from SDS011 sensor."""
    sensor.sleep(sleep=False)
    time.sleep(15)  # Warm up the sensor
    pm25, pm10 = sensor.query()
    sensor.sleep(sleep=True)
    return pm25, pm10

def main():
    """Main function to fetch AQI data and insert into database."""

    # Apply migrations on startup
    apply_migrations()

    try:
        while True:
            pm25, pm10 = get_sensor_data()
            aqi_pm25 = get_aqi(pm25, "PM2.5")
            aqi_pm10 = get_aqi(pm10, "PM10")
            overall_aqi = max(aqi_pm25, aqi_pm10)

            # Insert data into PostgreSQL database
            insert_aqi_data(pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)

            # Wait before the next reading
            # read every minute
            time.sleep(60)
    except KeyboardInterrupt:
        print("Stopping AQI monitoring...")
    finally:
        sensor.close()

if __name__ == "__main__":
    main()
