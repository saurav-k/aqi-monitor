import serial
import struct
from time import sleep

class ZPHS01B:
    """Provides methods to interact with the Winsen ZPHS01B multi-in-one air quality sensor via UART."""

    CMD_REQUEST_DATA = b"\xff\x01\x86\x00\x00\x00\x00\x00\x79"
    HEAD = 0xFF
    RESPONSE_SIZE = 26

    def __init__(self, serial_port, baudrate=9600, timeout=2):
        """Initialize the sensor and open the serial port."""
        self.ser = serial.Serial(port=serial_port, baudrate=baudrate, timeout=timeout)
        self.ser.flush()

    def _send_command(self, command):
        """Send a command to the sensor."""
        self.ser.write(command)

    def _read_response(self):
        """Read the response from the sensor."""
        response = self.ser.read(self.RESPONSE_SIZE)
        if len(response) == self.RESPONSE_SIZE and response[0] == self.HEAD:
            return response
        else:
            print(response)
            raise ValueError("Invalid response received from the sensor")

    def _calculate_checksum(self, data):
        """Calculate the checksum for the command or response data."""
        return (0xFF - (sum(data) % 0x100) + 1) & 0xFF

    def _parse_response(self, response):
        """Parse the response from the sensor and return a dictionary of sensor data."""
        if response[1] != 0x86:
            raise ValueError("Unexpected response format")

        # Parse the data according to the sensor's datasheet
        data = {
            "pm1.0": response[2] * 256 + response[3],
            "pm2.5": response[4] * 256 + response[5],
            "pm10": response[6] * 256 + response[7],
            "co2": response[8] * 256 + response[9],
            "voc": response[10],
            "temperature": ((response[11] * 256 + response[12]) - 500) * 0.1,
            "humidity": response[13] * 256 + response[14],
            "ch2o": (response[15] * 256 + response[16]) * 0.001,
            "co": (response[17] * 256 + response[18]) * 0.1,
            "o3": (response[19] * 256 + response[20]) * 0.01,
            "no2": (response[21] * 256 + response[22]) * 0.01
        }
        return data

    def read_data(self):
        """Send a request for data and parse the response."""
        self._send_command(self.CMD_REQUEST_DATA)
        response = self._read_response()
        return self._parse_response(response)

    def start_measurement(self):
        """Send a command to start the sensor measurement."""
        command = struct.pack('<BBBBBBBBB', 0xFF, 0x01, 0x78, 0x41, 0x00, 0x00, 0x00, 0x00, 0xB7)
        self._send_command(command)

    def stop_measurement(self):
        """Send a command to stop the sensor measurement."""
        command = struct.pack('<BBBBBBBBB', 0xFF, 0x01, 0x78, 0x00, 0x00, 0x00, 0x00, 0x00, 0x86)
        self._send_command(command)

    def set_abc_mode(self, enable=True):
        """Enable or disable ABC (Automatic Baseline Correction) mode."""
        mode = 0xA0 if enable else 0x00
        command = struct.pack('<BBBBBBBBB', 0xFF, 0x01, 0x79, mode, 0x00, 0x00, 0x00, 0x00, self._calculate_checksum([0x01, 0x79, mode]))
        self._send_command(command)

    def close(self):
        """Close the serial connection."""
        self.ser.close()

def calculate_aqi(concentration, breakpoints):
    for bp in breakpoints:
        if bp['C_low'] <= concentration <= bp['C_high']:
            return round(
                (bp['I_high'] - bp['I_low']) / (bp['C_high'] - bp['C_low']) * (concentration - bp['C_low']) + bp['I_low']
            )
    return None

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

# AQI breakpoints for CO (in ppm)
co_breakpoints = [
    {'C_low': 0.0, 'C_high': 4.4, 'I_low': 0, 'I_high': 50},
    {'C_low': 4.5, 'C_high': 9.4, 'I_low': 51, 'I_high': 100},
    {'C_low': 9.5, 'C_high': 12.4, 'I_low': 101, 'I_high': 150},
    # Add more breakpoints as needed
]

# AQI breakpoints for O3 (in ppm)
o3_breakpoints = [
    {'C_low': 0.0, 'C_high': 0.054, 'I_low': 0, 'I_high': 50},
    {'C_low': 0.055, 'C_high': 0.070, 'I_low': 51, 'I_high': 100},
    {'C_low': 0.071, 'C_high': 0.085, 'I_low': 101, 'I_high': 150},
    # Add more breakpoints as needed
]

# AQI breakpoints for NO2 (in ppm)
no2_breakpoints = [
    {'C_low': 0.0, 'C_high': 0.053, 'I_low': 0, 'I_high': 50},
    {'C_low': 0.054, 'C_high': 0.100, 'I_low': 51, 'I_high': 100},
    {'C_low': 0.101, 'C_high': 0.360, 'I_low': 101, 'I_high': 150},
    # Add more breakpoints as needed
]

# Sensor data
# sensor_data = {
#     'pm2.5': 16,  # µg/m³
#     'pm10': 17,   # µg/m³
#     'co': 0.5,    # ppm
#     'o3': 0.02,   # ppm
#     'no2': 0.01   # ppm
# }

# Example usage:
if __name__ == "__main__":
    # sensor = ZPHS01B("/dev/tty.SLAB_USBtoUART")
    sensor = ZPHS01B("/dev/ttyUSB0")
    try:
        sensor.start_measurement()  # Optionally start measurement
        sleep(10)
        sensor_data = sensor.read_data()
        print("Sensor Data:", sensor_data)
        sensor.stop_measurement()  # Optionally stop measurement
        
        # Calculate AQI for each pollutant
        aqi_pm2_5 = calculate_aqi(sensor_data['pm2.5'], pm2_5_breakpoints)
        aqi_pm10 = calculate_aqi(sensor_data['pm10'], pm10_breakpoints)
        aqi_co = calculate_aqi(sensor_data['co'], co_breakpoints)
        aqi_o3 = calculate_aqi(sensor_data['o3'], o3_breakpoints)
        aqi_no2 = calculate_aqi(sensor_data['no2'], no2_breakpoints)

        # Determine the overall AQI
        overall_aqi = max(filter(None, [aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2]))

        # Print the results
        print(f"AQI for PM2.5: {aqi_pm2_5}")
        print(f"AQI for PM10: {aqi_pm10}")
        print(f"AQI for CO: {aqi_co}")
        print(f"AQI for O3: {aqi_o3}")
        print(f"AQI for NO2: {aqi_no2}")
        print(f"Overall AQI: {overall_aqi}")

    except Exception as e:
        print("Error:", e)
    finally:
        sensor.close()
