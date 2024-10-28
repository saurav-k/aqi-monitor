from dotenv import load_dotenv
import os

import psycopg2
import time
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Database connection details
LOCAL_DB = os.getenv("LOCAL_DB")
REMOTE_DB = os.getenv("REMOTE_DB")

def sync_data():
    try:
        # Connect to local and remote databases
        local_conn = psycopg2.connect(LOCAL_DB)
        remote_conn = psycopg2.connect(REMOTE_DB)
        local_cur = local_conn.cursor()
        remote_cur = remote_conn.cursor()

        # Fetch the last run time from the local metadata table
        local_cur.execute("SELECT last_run FROM aqi_data.sync_metadata ORDER BY id DESC LIMIT 1")
        last_sync_time = local_cur.fetchone()
        last_sync_time = last_sync_time[0] if last_sync_time else datetime.min

        # Find any new rows in the local database that need to be synced
        local_cur.execute("""
            SELECT * FROM aqi_data.aqi_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_rows = local_cur.fetchall()

        # Insert new rows into the remote database
        if new_rows:
            remote_cur.executemany("""
                INSERT INTO aqi_data.aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, new_rows)
            remote_conn.commit()
            print(f"Synced {len(new_rows)} new rows.")

            # Update the sync metadata table with the current time after a successful sync
            local_cur.execute("INSERT INTO aqi_data.sync_metadata (last_run) VALUES (NOW())")
            local_conn.commit()

    except Exception as e:
        print("Error:", e)
    finally:
        local_cur.close()
        remote_cur.close()
        local_conn.close()
        remote_conn.close()

if __name__ == "__main__":
    while True:
        sync_data()
        time.sleep(120)  # Wait 2 minutes

