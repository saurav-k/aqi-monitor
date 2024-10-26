# AQI Monitoring Service

This project uses an SDS011 sensor to monitor air quality and store AQI data in a PostgreSQL database on a Raspberry Pi. The service is set up to run continuously in the background, automatically restarting if stopped and starting at boot.

## Prerequisites

- **Raspberry Pi** with Python 3 installed.
- **SDS011** sensor connected to the Raspberry Pi (using `/dev/ttyUSB0` as default).
- **PostgreSQL** database setup with the required tables.
- **Python dependencies**: Install the dependencies by running:

  ```bash
  pip install -r requirements.txt
  ```

## Setup Instructions

### 1. Clone the Repository and Configure the Database

1. Clone this repository to your Raspberry Pi:

   ```bash
   git clone <your-repository-url>
   cd <repository-directory>
   ```

2. Configure your database connection details in `db.py` or wherever applicable.

### 2. Run the Script as a `systemd` Service

#### Create a systemd Service File

1. Open a terminal on your Raspberry Pi.
2. Create a new `systemd` service file:

   ```bash
   sudo touch /etc/systemd/system/aqi-monitor.service

   sudo vi /etc/systemd/system/aqi-monitor.service
   ```

3. Add the following configuration to this file:

   ```ini
      [Unit]
      Description=AQI Monitoring Service
      After=network.target

      [Service]
      WorkingDirectory=/home/saurav/aqi-monitor-raspi-sds011/data-collector/
      ExecStart=/home/saurav/aqi-monitor-raspi-sds011/.venv/bin/python main.py
      Restart=always
      User=saurav
      Environment="PATH=/home/saurav/aqi-monitor-raspi-sds011/.venv/bin"
      NoNewPrivileges=false

      [Install]
      WantedBy=multi-user.target
   ```

   - Replace `/path/to/your/main.py` with the actual path to your `main.py` file.
   - Set `User=pi` to your username (usually `pi` on Raspberry Pi).

4. Save and close the file (`Ctrl+X`, `Y`, then `Enter`).

#### Enable and Start the Service

1. Reload the `systemd` daemon to recognize the new service:

   ```bash
   sudo systemctl daemon-reload
   ```

2. Enable the service to start automatically on boot:

   ```bash
   sudo systemctl enable aqi-monitor.service
   ```

3. Start the service:

   ```bash
   sudo systemctl start aqi-monitor.service
   ```

4. Check the status to ensure it’s running correctly:

   ```bash
   sudo systemctl status aqi-monitor.service
   ```

   You should see `Active: active (running)` if the service is working as expected.

### 3. Managing the Service

You can use the following commands to manage the AQI Monitoring Service:

- **Stop the service**: `sudo systemctl stop aqi-monitor.service`
- **Restart the service**: `sudo systemctl restart aqi-monitor.service`
- **Check service logs**: `sudo journalctl -u aqi-monitor.service -f`

---

This setup will keep the AQI monitoring script running in the background, automatically restarting on failure, and starting on boot. The AQI data collected from the SDS011 sensor will be stored in your PostgreSQL database.