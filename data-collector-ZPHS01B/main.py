# main.py
import time
from zphs01b import ZPHS01B

# Initialize ZPHS01B sensor
SERIAL_PORT = "/dev/ttyUSB1"  # Update the port as needed
sensor = ZPHS01B(SERIAL_PORT)

def get_aqi(pm_value):
    """Calculate AQI for PM2.5 based on given value."""
    breakpoints = [
        (0, 30, 0, 50), 
        (30, 60, 51, 100), 
        (60, 90, 101, 200), 
        (90, 120, 201, 300), 
        (120, 250, 301, 400), 
        (250, 500, 401, 500)
    ]
    for (c_low, c_high, i_low, i_high) in breakpoints:
        if c_low <= pm_value <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm_value - c_low) + i_low)
    return 500  # Cap AQI at 500 if out of range

def get_sensor_data():
    """Fetch PM2.5 data from ZPHS01B sensor."""
    data = sensor.read_data()
    pm25 = data['pm2.5']
    return pm25, data

def main():
    """Main function to fetch AQI data and print it."""
    try:
        while True:
            pm25, sensor_data = get_sensor_data()
            aqi_pm25 = get_aqi(pm25)

            # Print PM2.5 data and AQI
            print("PM2.5:", pm25, "µg/m³")
            print("AQI PM2.5:", aqi_pm25)
            print("CO2:", sensor_data["co2"], "ppm")
            print("Temperature:", sensor_data["temperature"], "°C")
            print("Humidity:", sensor_data["humidity"], "%")
            print("-" * 40)

            # Wait before the next reading (read every minute)
            time.sleep(60)
    except KeyboardInterrupt:
        print("Stopping AQI monitoring...")
    finally:
        sensor.close()

if __name__ == "__main__":
    main()
