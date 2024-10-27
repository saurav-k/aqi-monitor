<!-- ```markdown -->
# AQI Monitoring System

This project is an Air Quality Index (AQI) Monitoring System, comprising three main components: a data collector, backend, and frontend. Together, these components allow for the real-time collection, storage, processing, and visualization of AQI data.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Components](#components)
    - [Data Collector](#data-collector)
    - [Backend](#backend)
    - [Frontend](#frontend)
- [Technology Stack](#technology-stack)
- [Setup Instructions](#setup-instructions)

## Overview

The AQI Monitoring System is designed to capture air quality data, store it, process it, and present it visually. This system is especially useful for monitoring key air quality indicators, including PM2.5 and PM10 levels, and providing timely, insightful data to users.

## Architecture

The system architecture includes the following components:
1. **Data Collector**: Gathers AQI data from sensors and stores it in a PostgreSQL database.
2. **Backend**: Processes data from the database, performs calculations, and exposes APIs for the frontend.
3. **Frontend**: Provides a web-based user interface to display AQI data in real-time.

## Components

### Data Collector

The Data Collector is a Go-based application that gathers AQI data from connected sensors (e.g., SDS011 sensor). The data collector performs the following tasks:

- Collects data on particulate matter (PM2.5 and PM10) levels.
- Calculates AQI values based on PM2.5 and PM10 readings.
- Stores the data in a PostgreSQL database for historical tracking and analysis.

**Tech Stack**:
- **Language**: Go
- **Hardware**: Raspberry Pi with SDS011 Sensor
- **Database**: PostgreSQL (schema: `aqi_data`, with columns `id`, `timestamp`, `pm25`, `pm10`, `aqi_pm25`, `aqi_pm10`, `overall_aqi`)

### Backend

The Backend is a FastAPI-based Python API service that connects to the PostgreSQL database, retrieves AQI data, and provides endpoints for the frontend to access this data. Key responsibilities include:

- Fetching and processing data from PostgreSQL.
- Calculating AQI and providing data endpoints for time-based queries.
- Handling data storage optimizations and maintaining data integrity.

**Tech Stack**:
- **Language**: Python
- **Framework**: FastAPI
- **Libraries**:
    - `py-sds011==0.9`: Communicates with the SDS011 sensor to capture PM2.5 and PM10 data.
    - `psycopg2-binary==2.9.10`: PostgreSQL database adapter for Python, used for database interactions.
    - `alembic==1.13.3`: Database migrations tool, useful for managing schema changes.
    - `sqlalchemy`: SQL toolkit and ORM, used to map data models to the PostgreSQL database.
    - `fastapi[all]`: FastAPI framework for building and serving RESTful APIs.
    - `uvicorn`: ASGI server to serve FastAPI applications.
  
### Frontend

The Frontend is a React-based web application that visualizes AQI data, showing various trends, charts, and other key indicators for PM2.5 and PM10 levels over time.

Features include:
- Real-time charts displaying AQI trends and historical data.
- User-selectable options to view data over different time ranges (e.g., 1 hour, 4 hours, 24 hours).
- Detailed views for PM2.5, PM10, and overall AQI values.

**Tech Stack**:
- **Language**: JavaScript, TypeScript
- **Framework**: React
- **Charts Library**: Chart.js (for data visualization)

## Technology Stack

| Component      | Technology      | Purpose                                      |
| -------------- | --------------- | -------------------------------------------- |
| Data Collector | Go              | Sensor data collection and AQI calculation   |
| Backend        | Python, FastAPI | API services and data processing             |
| Frontend       | React, Chart.js | Visualization of AQI data                    |
| Database       | PostgreSQL      | Persistent storage for AQI data              |

## Setup Instructions

### Prerequisites
- **Go** for Data Collector
- **Python** (recommended 3.8+) and **pip** for Backend
- **Node.js** and **npm** for Frontend
- **PostgreSQL** for data storage
- **Raspberry Pi** with SDS011 sensor (for the data collector setup)

### Step 1: Setting Up PostgreSQL
1. Create a PostgreSQL database and configure the schema with the necessary tables in `aqi_data`.
2. Populate the database with the required structure for storing AQI data.

### Step 2: Running the Data Collector
1. Set up the Go environment and ensure your Raspberry Pi can read data from the SDS011 sensor.
2. Run the data collector, which will populate the PostgreSQL database with AQI data.

### Step 3: Starting the Backend
1. Navigate to the `backend` directory.
2. Install dependencies by running:

   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server with Uvicorn:

   ```bash
   uvicorn main:app --reload
   ```

4. The backend API should now be running at `http://127.0.0.1:8000`.

### Step 4: Launching the Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Start the frontend server with `npm start`.

The application will now be accessible in your web browser, displaying real-time AQI data from the data collector.

## Future Improvements

Potential future updates include:
- Adding support for additional air quality sensors.
- Implementing user authentication and data filtering.
- Enhanced data analysis and alerting based on AQI levels.

## License

This project is open-source and available under the MIT License.

---

This setup will provide a full-stack AQI monitoring solution, from data collection to visualization. For any issues or further information, please refer to the documentation or reach out.

contact :-  ksaurav3045@gmail.com

