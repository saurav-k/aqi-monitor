# main.py
from db import apply_migrations, insert_aqi_data, insert_zphs01b_data
import time
from sds011 import SDS011
from zpsh01_sensor import ZPHS01B

# Initialize SDS011 sensor
SERIAL_PORT = "/dev/ttyUSB1"
sensor = SDS011(SERIAL_PORT, use_query_mode=True)
SERIAL_PORT_zpsh01 = "/dev/ttyUSB0"
zpsh01_sensor = ZPHS01B(SERIAL_PORT_zpsh01)

# AQI breakpoints for PM2.5 (in µg/m³) as per Indian standards
pm2_5_breakpoints = [
    {'C_low': 0, 'C_high': 30, 'I_low': 0, 'I_high': 50},
    {'C_low': 30, 'C_high': 60, 'I_low': 51, 'I_high': 100},
    {'C_low': 60, 'C_high': 90, 'I_low': 101, 'I_high': 200},
    {'C_low': 90, 'C_high': 120, 'I_low': 201, 'I_high': 300},
    {'C_low': 120, 'C_high': 250, 'I_low': 301, 'I_high': 400},
    {'C_low': 250, 'C_high': 500, 'I_low': 401, 'I_high': 500}
]

# AQI breakpoints for PM10 (in µg/m³) as per Indian standards
pm10_breakpoints = [
    {'C_low': 0, 'C_high': 50, 'I_low': 0, 'I_high': 50},
    {'C_low': 50, 'C_high': 100, 'I_low': 51, 'I_high': 100},
    {'C_low': 100, 'C_high': 250, 'I_low': 101, 'I_high': 200},
    {'C_low': 250, 'C_high': 350, 'I_low': 201, 'I_high': 300},
    {'C_low': 350, 'C_high': 430, 'I_low': 301, 'I_high': 400},
    {'C_low': 430, 'C_high': 500, 'I_low': 401, 'I_high': 500}
]

# AQI breakpoints for CO (in mg/m³)
co_breakpoints = [
    {'C_low': 0.0, 'C_high': 1.0, 'I_low': 0, 'I_high': 50},
    {'C_low': 1.1, 'C_high': 2.0, 'I_low': 51, 'I_high': 100},
    {'C_low': 2.1, 'C_high': 10.0, 'I_low': 101, 'I_high': 200},
    {'C_low': 10.1, 'C_high': 17.0, 'I_low': 201, 'I_high': 300},
    {'C_low': 17.1, 'C_high': 34.0, 'I_low': 301, 'I_high': 400},
    {'C_low': 34.1, 'C_high': 50.0, 'I_low': 401, 'I_high': 500}  # Adjust as needed for upper range
]

# AQI breakpoints for O3 (in µg/m³)
o3_breakpoints = [
    {'C_low': 0.0, 'C_high': 50.0, 'I_low': 0, 'I_high': 50},
    {'C_low': 51.0, 'C_high': 100.0, 'I_low': 51, 'I_high': 100},
    {'C_low': 101.0, 'C_high': 168.0, 'I_low': 101, 'I_high': 200},
    {'C_low': 169.0, 'C_high': 208.0, 'I_low': 201, 'I_high': 300},
    {'C_low': 209.0, 'C_high': 748.0, 'I_low': 301, 'I_high': 400},
    {'C_low': 748.1, 'C_high': 1000.0, 'I_low': 401, 'I_high': 500}  # Adjust as needed for upper range
]

# AQI breakpoints for NO2 (in µg/m³, 24-hour average)
no2_breakpoints = [
    {'C_low': 0.0, 'C_high': 40.0, 'I_low': 0, 'I_high': 50},
    {'C_low': 41.0, 'C_high': 80.0, 'I_low': 51, 'I_high': 100},
    {'C_low': 81.0, 'C_high': 180.0, 'I_low': 101, 'I_high': 200},
    {'C_low': 181.0, 'C_high': 280.0, 'I_low': 201, 'I_high': 300},
    {'C_low': 281.0, 'C_high': 400.0, 'I_low': 301, 'I_high': 400},
    {'C_low': 400.1, 'C_high': 500.0, 'I_low': 401, 'I_high': 500}  # Adjust as needed for upper range
]

# AQI breakpoints for SO2 (in µg/m³)
so2_breakpoints = [
    {'C_low': 0.0, 'C_high': 40.0, 'I_low': 0, 'I_high': 50},
    {'C_low': 41.0, 'C_high': 80.0, 'I_low': 51, 'I_high': 100},
    {'C_low': 81.0, 'C_high': 380.0, 'I_low': 101, 'I_high': 200},
    {'C_low': 381.0, 'C_high': 800.0, 'I_low': 201, 'I_high': 300},
    {'C_low': 801.0, 'C_high': 1600.0, 'I_low': 301, 'I_high': 400},
    {'C_low': 1600.1, 'C_high': 2000.0, 'I_low': 401, 'I_high': 500}  # Adjust as needed for upper range
]

# AQI breakpoints for NH3 (in µg/m³, 24-hour average)
nh3_breakpoints = [
    {'C_low': 0.0, 'C_high': 200.0, 'I_low': 0, 'I_high': 50},
    {'C_low': 201.0, 'C_high': 400.0, 'I_low': 51, 'I_high': 100},
    {'C_low': 401.0, 'C_high': 800.0, 'I_low': 101, 'I_high': 200},
    {'C_low': 801.0, 'C_high': 1200.0, 'I_low': 201, 'I_high': 300},
    {'C_low': 1201.0, 'C_high': 1800.0, 'I_low': 301, 'I_high': 400},
    {'C_low': 1800.1, 'C_high': 2000.0, 'I_low': 401, 'I_high': 500}  # Adjust as needed for upper range
]

def get_aqi(pm_value, pollutant_type):
    if pollutant_type == "PM2.5":
        breakpoints = [
            (0, 30, 0, 50), 
            (30, 60, 51, 100), 
            (60, 90, 101, 200), 
            (90, 120, 201, 300), 
            (120, 250, 301, 400), 
            (250, 500, 401, 500)
        ]
    elif pollutant_type == "PM10":
        breakpoints = [
            (0, 50, 0, 50), 
            (50, 100, 51, 100), 
            (100, 250, 101, 200), 
            (250, 350, 201, 300), 
            (350, 430, 301, 400), 
            (430, 500, 401, 500)
        ]
    else:
        raise ValueError("Invalid pollutant type. Must be 'PM2.5' or 'PM10'.")
    for (c_low, c_high, i_low, i_high) in breakpoints:
        if c_low <= pm_value <= c_high:
            return round(((i_high - i_low) / (c_high - c_low)) * (pm_value - c_low) + i_low)
    return 500  # Cap AQI at 500 if out of range


def get_sensor_data():
    """Fetch data from SDS011 sensor."""
    sensor.sleep(sleep=False)
    time.sleep(15)  # Warm up the sensor
    pm25, pm10 = sensor.query()
    sensor.sleep(sleep=True)
    return pm25, pm10

def get_zpsh01_sensor_data():
    """Fetch data from zpsh01 sensor."""
    zpsh01_sensor.start_measurement()
    zpsh01_sensor.set_abc_mode() 
    time.sleep(15)  # Warm up the sensor
    result = zpsh01_sensor.read_data()
    zpsh01_sensor.stop_measurement()
    return result

def main():
    """Main function to fetch AQI data and insert into database."""

    # Apply migrations on startup
    apply_migrations()

    try:
        while True:
            process_zpsh01_sensor()
            pm25, pm10 = get_sensor_data()
            aqi_pm25 = get_aqi(pm25, "PM2.5")
            aqi_pm10 = get_aqi(pm10, "PM10")
            overall_aqi = max(aqi_pm25, aqi_pm10)
            
            # Insert data into PostgreSQL database
            insert_aqi_data(pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
            
            

            # Wait before the next reading
            # read every minute
            time.sleep(30)
    except KeyboardInterrupt:
        print("Stopping AQI monitoring...")
    finally:
        sensor.close()

def convert_ppm_to_ugm3(ppm_value, molar_mass):
    """Convert ppm to µg/m³ using the molar mass of the gas."""
    return ppm_value * 1000 * (molar_mass / 24.45)

def calculate_aqi(concentration, breakpoints):
    for bp in breakpoints:
        if bp['C_low'] <= concentration <= bp['C_high']:
            return round(
                (bp['I_high'] - bp['I_low']) / (bp['C_high'] - bp['C_low']) * (concentration - bp['C_low']) + bp['I_low']
            )
    return 0  # Default to 0 if out of range

def process_zpsh01_sensor():
            # Fetch data from ZPHS01B sensor
        zpsh01_data = get_zpsh01_sensor_data()
        
        # Convert ppm to µg/m³
        # zpsh01_data['co'] = convert_ppm_to_ugm3(zpsh01_data['co'], 28.01)  # CO
        # zpsh01_data['o3'] = convert_ppm_to_ugm3(zpsh01_data['o3'], 48.00)  # O3
        # zpsh01_data['no2'] = convert_ppm_to_ugm3(zpsh01_data['no2'], 46.0055)  # NO2
        
        # # Calculate AQI for each pollutant from ZPHS01B
        # zpsh01_data['aqi_pm2.5'] = calculate_aqi(zpsh01_data['pm2.5'], pm2_5_breakpoints)
        # zpsh01_data['aqi_pm10'] = calculate_aqi(zpsh01_data['pm10'], pm10_breakpoints)
        # zpsh01_data['aqi_co'] = calculate_aqi(zpsh01_data['co'], co_breakpoints)
        # zpsh01_data['aqi_o3'] = calculate_aqi(zpsh01_data['o3'], o3_breakpoints)
        # zpsh01_data['aqi_no2'] = calculate_aqi(zpsh01_data['no2'], no2_breakpoints)
        
        zpsh01_data['aqi_pm2.5'] = 0
        zpsh01_data['aqi_pm10'] = 0
        zpsh01_data['aqi_co'] = 0
        zpsh01_data['aqi_o3'] = 0
        zpsh01_data['aqi_no2'] = 0
        
        zpsh01_data['overall_aqi'] = max(
            zpsh01_data['aqi_pm2.5'], zpsh01_data['aqi_pm10'], zpsh01_data['aqi_co'],
            zpsh01_data['aqi_o3'], zpsh01_data['aqi_no2']
        )

        # Insert ZPHS01B data into the database
        insert_zphs01b_data(zpsh01_data)
    
if __name__ == "__main__":
    main()
