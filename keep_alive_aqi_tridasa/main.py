import requests
import schedule
import time
from datetime import datetime

# Function to send a request to the server
def keep_alive_request():
    try:
        response = requests.get("https://www.tridasa.online/")
        with open("/home/saurav/aqi-monitor-raspi-sds011/keep_alive.log", "a") as log_file:
            if response.status_code == 200:
                log_file.write(f"{datetime.now()} - Server is alive. Response code: {response.status_code}\n")
            else:
                log_file.write(f"{datetime.now()} - Server responded with non-200 status code: {response.status_code}\n")
    except requests.exceptions.RequestException as e:
        with open("/home/saurav/aqi-monitor-raspi-sds011/keep_alive.log", "a") as log_file:
            log_file.write(f"{datetime.now()} - Request failed: {e}\n")

# Schedule the request to run every minute
schedule.every(1).minute.do(keep_alive_request)

# Log when the script starts
with open("/home/saurav/aqi-monitor-raspi-sds011/keep_alive.log", "a") as log_file:
    log_file.write(f"{datetime.now()} - Keep-alive script started. Sending requests every minute...\n")

# Keep the script running continuously
while True:
    schedule.run_pending()
    time.sleep(1)
