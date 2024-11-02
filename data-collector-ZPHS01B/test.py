import serial

SERIAL_PORT = "/dev/serial0"
ser = serial.Serial(SERIAL_PORT, baudrate=9600, timeout=2)
ser.write(b"\xff\x01\x86\x00\x00\x00\x00\x00\x79")
response = ser.read(26)
print("Response:", response)
ser.close()
