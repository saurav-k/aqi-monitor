import time
from sds011 import SDS011

# Configure the serial port your SDS011 is connected to
# Default serial port for Raspberry Pi is usually /dev/ttyUSB0 or /dev/ttyUSB1
SERIAL_PORT = "/dev/ttyUSB0"

# Initialize SDS011
sensor = SDS011(SERIAL_PORT, use_query_mode=True)

def get_aqi(pm_value):
    """Convert PM2.5 or PM10 concentration to AQI based on standard AQI conversion tables."""
    if pm_value <= 12.0:
        return (50 / 12.0) * pm_value
    elif pm_value <= 35.4:
        return ((100 - 51) / (35.4 - 12.1)) * (pm_value - 12.1) + 51
    elif pm_value <= 55.4:
        return ((150 - 101) / (55.4 - 35.5)) * (pm_value - 35.5) + 101
    elif pm_value <= 150.4:
        return ((200 - 151) / (150.4 - 55.5)) * (pm_value - 55.5) + 151
    elif pm_value <= 250.4:
        return ((300 - 201) / (250.4 - 150.5)) * (pm_value - 150.5) + 201
    elif pm_value <= 350.4:
        return ((400 - 301) / (350.4 - 250.5)) * (pm_value - 250.5) + 301
    elif pm_value <= 500.4:
        return ((500 - 401) / (500.4 - 350.5)) * (pm_value - 350.5) + 401
    else:
        return 500  # AQI capped at 500 for very high pollution levels

def get_sensor_data():
    """Query SDS011 sensor for PM2.5 and PM10 data."""
    sensor.sleep(sleep=False)
    time.sleep(15)  # Allow the sensor to warm up
    pm25, pm10 = sensor.query()
    sensor.sleep(sleep=True)  # Put the sensor back to sleep after querying
    return pm25, pm10

try:
    while True:
        pm25, pm10 = get_sensor_data()
        print(f"pm25 raw data : - {pm25} & pm10 raw data : - {pm10}")
        aqi_pm25 = get_aqi(pm25)
        aqi_pm10 = get_aqi(pm10)
        print(f"PM2.5: {pm25} µg/m³, AQI (PM2.5): {aqi_pm25}")
        print(f"PM10: {pm10} µg/m³, AQI (PM10): {aqi_pm10}")
        
        time.sleep(60)  # Adjust based on how often you want to check AQI

except KeyboardInterrupt:
    print("Stopping the AQI monitoring...")
finally:
    sensor.close()
