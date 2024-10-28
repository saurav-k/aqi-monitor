Here's a step-by-step guide to set up and run your Python application using systemd on a server, as outlined:

### Step-by-Step Guide

1. **Create the systemd service file**: Open a new file for the service configuration.

   ```bash
   sudo vi /etc/systemd/system/aqi-monitor.service
   ```

2. **Add the service configuration**: Copy and paste the following configuration into the file:

   ```ini
   [Unit]
   Description=AQI Monitoring Service API
   After=network.target

   [Service]
   WorkingDirectory=/home/ec2-user/workdir/aqi-monitor/backend/
   Environment="98.130.74.124"
   ExecStart=/home/ec2-user/workdir/aqi-monitor/.venv/bin/uvicorn main:app  --host 98.130.74.124 --port 8082 --reload 
   Restart=always
   User=saurav
   Environment="PATH=/home/ec2-user/workdir/aqi-monitor/.venv/bin"
   NoNewPrivileges=false

   [Install]
   WantedBy=multi-user.target
   ```

3. **Save and close** the file by pressing `CTRL + X`, then `Y`, and `Enter`.

4. **Reload systemd** to recognize the new service:

   ```bash
   sudo systemctl daemon-reload
   ```

5. **Enable the service** to start automatically on boot:

   ```bash
   sudo systemctl enable aqi-monitor.service
   ```

6. **Start the service** immediately:

   ```bash
   sudo systemctl start aqi-monitor.service
   ```

7. **Check the service status** to ensure it’s running properly:

   ```bash
   sudo systemctl status aqi-monitor.service
   ```

### Additional Notes:

- This setup will run `uvicorn` as a daemon service, automatically restarting it if it fails or on system reboot.
- To stop or restart the service, use:

  ```bash
  sudo systemctl stop aqi-monitor.service
  sudo systemctl restart aqi-monitor.service
  ```

Your AQI Monitoring Service API should now be running in the background on port `8082` and restart automatically if the system reboots or if the service crashes.