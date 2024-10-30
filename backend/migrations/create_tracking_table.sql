CREATE TABLE aqi_data.tracking_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),  -- IPv4 and IPv6 compatibility
    details JSON
);
