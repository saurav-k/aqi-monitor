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
REMOTE_RDS_DB = os.getenv("REMOTE_RDS_DB")


def sync_data_rds():
    try:
        # Attempt to connect to local and remote databases
        local_conn = psycopg2.connect(LOCAL_DB)
        remote_rds_conn = psycopg2.connect(REMOTE_RDS_DB)
        
        local_cur = local_conn.cursor()
        remote_cur = remote_rds_conn.cursor()

        print("Connected to both local and remote databases")

        # Fetch the last run time from the local metadata table
        local_cur.execute("SELECT last_run FROM aqi_data.sync_metadata_rds ORDER BY id DESC LIMIT 1")
        last_sync_time = local_cur.fetchone()
        last_sync_time = last_sync_time[0] if last_sync_time else datetime.min

        print(f"Last sync timestamp: {last_sync_time}")

        # Sync data from aqi_readings table
        local_cur.execute("""
            SELECT timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi 
            FROM aqi_data.aqi_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_aqi_rows = local_cur.fetchall()

        # Insert new rows into the remote aqi_readings table
        CHUNK_SIZE = 100
        if new_aqi_rows:
            print(f"Found {len(new_aqi_rows)} new rows to sync in aqi_readings")

            for i in range(0, len(new_aqi_rows), CHUNK_SIZE):
                chunk = new_aqi_rows[i:i + CHUNK_SIZE]
                remote_cur.executemany("""
                    INSERT INTO aqi_data.aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (timestamp) DO NOTHING
                """, chunk)
                remote_rds_conn.commit()
                print(f"Inserted chunk {i // CHUNK_SIZE + 1} with {len(chunk)} rows into aqi_readings")

        # Sync data from zphs01b_readings table
        local_cur.execute("""
            SELECT timestamp, pm1_0, pm2_5, pm10, co2, voc, temperature, humidity, 
                   ch2o, co, o3, no2, aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2, overall_aqi
            FROM aqi_data.zphs01b_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_zphs01b_rows = local_cur.fetchall()

        if new_zphs01b_rows:
            print(f"Found {len(new_zphs01b_rows)} new rows to sync in zphs01b_readings")

            for i in range(0, len(new_zphs01b_rows), CHUNK_SIZE):
                chunk = new_zphs01b_rows[i:i + CHUNK_SIZE]
                remote_cur.executemany("""
                    INSERT INTO aqi_data.zphs01b_readings (
                        timestamp, pm1_0, pm2_5, pm10, co2, voc, temperature, humidity, 
                        ch2o, co, o3, no2, aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2, overall_aqi
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (timestamp) DO NOTHING
                """, chunk)
                remote_rds_conn.commit()
                print(f"Inserted chunk {i // CHUNK_SIZE + 1} with {len(chunk)} rows into zphs01b_readings")

        # Update the sync metadata table with the current time after a successful sync
        local_cur.execute("INSERT INTO aqi_data.sync_metadata_rds (last_run) VALUES (NOW() + INTERVAL '5 hours 30 minutes')")
        local_conn.commit()
        print("Sync metadata updated with new timestamp.")

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
            remote_rds_conn.close()
            
            
def sync_data():
    try:
        # Attempt to connect to local and remote databases
        local_conn = psycopg2.connect(LOCAL_DB)
        remote_conn = psycopg2.connect(REMOTE_DB)
        
        local_cur = local_conn.cursor()
        remote_rds_cur = remote_conn.cursor()

        print("Connected to both local and remote databases")

        # Fetch the last run time from the local metadata table
        local_cur.execute("SELECT last_run FROM aqi_data.sync_metadata ORDER BY id DESC LIMIT 1")
        last_sync_time = local_cur.fetchone()
        last_sync_time = last_sync_time[0] if last_sync_time else datetime.min

        print(f"Last sync timestamp: {last_sync_time}")

        # Sync data from aqi_readings table
        local_cur.execute("""
            SELECT timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi 
            FROM aqi_data.aqi_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_aqi_rows = local_cur.fetchall()

        # Insert new rows into the remote aqi_readings table
        CHUNK_SIZE = 100
        if new_aqi_rows:
            print(f"Found {len(new_aqi_rows)} new rows to sync in aqi_readings")

            for i in range(0, len(new_aqi_rows), CHUNK_SIZE):
                chunk = new_aqi_rows[i:i + CHUNK_SIZE]
                remote_rds_cur.executemany("""
                    INSERT INTO aqi_data.aqi_readings (timestamp, pm25, pm10, aqi_pm25, aqi_pm10, overall_aqi)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (timestamp) DO NOTHING
                """, chunk)
                remote_conn.commit()
                print(f"Inserted chunk {i // CHUNK_SIZE + 1} with {len(chunk)} rows into aqi_readings")

        # Sync data from zphs01b_readings table
        local_cur.execute("""
            SELECT timestamp, pm1_0, pm2_5, pm10, co2, voc, temperature, humidity, 
                   ch2o, co, o3, no2, aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2, overall_aqi
            FROM aqi_data.zphs01b_readings WHERE timestamp > %s
        """, (last_sync_time,))
        new_zphs01b_rows = local_cur.fetchall()

        if new_zphs01b_rows:
            print(f"Found {len(new_zphs01b_rows)} new rows to sync in zphs01b_readings")

            for i in range(0, len(new_zphs01b_rows), CHUNK_SIZE):
                chunk = new_zphs01b_rows[i:i + CHUNK_SIZE]
                remote_rds_cur.executemany("""
                    INSERT INTO aqi_data.zphs01b_readings (
                        timestamp, pm1_0, pm2_5, pm10, co2, voc, temperature, humidity, 
                        ch2o, co, o3, no2, aqi_pm2_5, aqi_pm10, aqi_co, aqi_o3, aqi_no2, overall_aqi
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (timestamp) DO NOTHING
                """, chunk)
                remote_conn.commit()
                print(f"Inserted chunk {i // CHUNK_SIZE + 1} with {len(chunk)} rows into zphs01b_readings")

        # Update the sync metadata table with the current time after a successful sync
        local_cur.execute("INSERT INTO aqi_data.sync_metadata (last_run) VALUES (NOW() + INTERVAL '5 hours 30 minutes')")
        local_conn.commit()
        print("Sync metadata updated with new timestamp.")

    except psycopg2.OperationalError as e:
        print("Database connection error:", e)

    except Exception as e:
        print("Unexpected error:", e)

    finally:
        # Close connections if they were successfully created
        if 'local_cur' in locals():
            local_cur.close()
        if 'remote_cur' in locals():
            remote_rds_cur.close()
        if 'local_conn' in locals():
            local_conn.close()
        if 'remote_conn' in locals():
            remote_conn.close()

if __name__ == "__main__":
    while True:
        sync_data_rds()
        sync_data()
        time.sleep(120)  # Wait 2 minutes
