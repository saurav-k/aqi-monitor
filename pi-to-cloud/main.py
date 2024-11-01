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
        # Attempt to connect to local and remote databases
        local_conn = psycopg2.connect(LOCAL_DB)
        remote_conn = psycopg2.connect(REMOTE_DB)
        
        local_cur = local_conn.cursor()
        remote_cur = remote_conn.cursor()

        print("Connected to both local and remote databases")

        # Fetch the last run time from the local metadata table
        local_cur.execute("SELECT last_run FROM aqi_data.sync_metadata ORDER BY id DESC LIMIT 1")
        last_sync_time = local_cur.fetchone()
        last_sync_time = last_sync_time[0] if last_sync_time else datetime.min

        print(f"Last sync timestamp: {last_sync_time}")

        # Find any new rows in the local database that need to be synced (exclude `id`)
        local_cur.execute("""
            SELECT timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi 
            FROM aqi_data.aqi_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_rows = local_cur.fetchall()

        # Insert new rows in chunks of 100 with ON CONFLICT DO NOTHING
        CHUNK_SIZE = 100
        if new_rows:
            print(f"Found {len(new_rows)} new rows to sync")
            # print(f"First row data for debugging: {new_rows[0]}")  # Debug print for first row

            for i in range(0, len(new_rows), CHUNK_SIZE):
                chunk = new_rows[i:i + CHUNK_SIZE]
                remote_cur.executemany("""
                    INSERT INTO aqi_data.aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (timestamp) DO NOTHING
                """, chunk)
                remote_conn.commit()
                print(f"Inserted chunk {i // CHUNK_SIZE + 1} with {len(chunk)} rows")

            # Update the sync metadata table with the current time after a successful sync
            # Update the sync metadata table with the current time in UTC+5:30
            local_cur.execute("INSERT INTO aqi_data.sync_metadata (last_run) VALUES (NOW() + INTERVAL '5 hours 30 minutes')")
            local_conn.commit()
            print("Sync metadata updated with new timestamp.")

        else:
            print("No new rows found to sync.")

    except psycopg2.OperationalError as e:
        print("Database connection error:", e)

    except Exception as e:
        print("Unexpected error:", e)

    finally:
        # Close connections if they were successfully created
        if 'local_cur' in locals():
            local_cur.close()
        if 'remote_cur' in locals():
            remote_cur.close()
        if 'local_conn' in locals():
            local_conn.close()
        if 'remote_conn' in locals():
            remote_conn.close()

if __name__ == "__main__":
    while True:
        sync_data()
        time.sleep(120)  # Wait 2 minutes