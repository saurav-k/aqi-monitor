# main.py
from db import apply_migrations, insert_aqi_data
import time
from sds011 import SDS011

# Initialize SDS011 sensor
SERIAL_PORT = "/dev/ttyUSB0"
sensor = SDS011(SERIAL_PORT, use_query_mode=True)

def get_aqi(pm_value, pollutant_type):
    # This function converts PM values to AQI
    breakpoints = [(0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150), 
                   (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300), (250.5, 350.4, 301, 400), 
                   (350.5, 500.4, 401, 500)]
    for (c_low, c_high, i_low, i_high) in breakpoints:
        if c_low <= pm_value <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm_value - c_low) + i_low)
    return 500  # Max AQI value

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
            time.sleep(10)
    except KeyboardInterrupt:
        print("Stopping AQI monitoring...")
    finally:
        sensor.close()

if __name__ == "__main__":
    main()
