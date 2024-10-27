# Run the app
# uvicorn main:app --reload --port 8082

#  nohup uvicorn main:app --reload --port 8082 &


# sudo systemctl start  aqi-monitor-backend.service


```ini
[Unit]
Description=AQI Monitoring Service API
After=network.target

[Service]
WorkingDirectory=/home/saurav/aqi-monitor-raspi-sds011/backend/
ExecStart=/home/saurav/aqi-monitor-raspi-sds011/.venv/bin/uvicorn main:app --reload --port 8082
Restart=always
User=saurav
Environment="PATH=/home/saurav/aqi-monitor-raspi-sds011/.venv/bin"
NoNewPrivileges=false

[Install]
WantedBy=multi-user.target
```

### Steps to Enable and Start the Service
1. **Save the file** as `/etc/systemd/system/aqi-monitor.service`.
2. **Reload systemd** to recognize the new service:
   ```bash
   sudo systemctl daemon-reload
   ```
3. **Enable the service** to start on boot:
   ```bash
   sudo systemctl enable aqi-monitor.service
   ```
4. **Start the service** immediately:
   ```bash
   sudo systemctl start aqi-monitor.service
   ```
5. **Check the service status** to ensure it’s running:
   ```bash
   sudo systemctl status aqi-monitor.service
   ```

This setup will start `uvicorn` as a daemon and automatically restart the service if it fails or if the system reboots.