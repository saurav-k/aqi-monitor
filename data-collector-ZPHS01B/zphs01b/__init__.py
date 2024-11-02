import serial
import struct

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

# Example usage:
if __name__ == "__main__":
    sensor = ZPHS01B("/dev/ttyUSB0")
    try:
        sensor.start_measurement()  # Optionally start measurement
        data = sensor.read_data()
        print("Sensor Data:", data)
        sensor.stop_measurement()  # Optionally stop measurement
    except Exception as e:
        print("Error:", e)
    finally:
        sensor.close()
