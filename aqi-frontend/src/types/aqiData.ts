export interface AQIData {
    timestamp: string;
    aqi_pm25: number;
    aqi_pm10: number;
    pm25: number;
    pm10: number;
    overall_aqi: number;
}


export interface ZPHS01BData {
    timestamp: string;
    pm1_0: number;
    pm2_5: number;
    pm10: number;
    co2: number;
    voc: number;
    temperature: number;
    humidity: number;
    ch2o: number;
    co: number;
    o3: number;
    no2: number;
    aqi_pm2_5: number;
    aqi_pm10: number;
    aqi_co: number;
    aqi_o3: number;
    aqi_no2: number;
    overall_aqi: number;
  }
  


  export interface WeatherData {
    timestamp: string; // ISO timestamp string
    temperature?: number; // Temperature in Celsius (optional)
    humidity?: number; // Humidity percentage (optional)
    wind_speed?: number; // Wind speed in m/s (optional)
    wind_direction?: number; // Wind direction in degrees (optional)
    rain_intensity?: number; // Rain intensity in mm/hr (optional)
    rain_accumulation?: number; // Rain accumulation in mm (optional)
    city_name?: string; // City name (optional)
    locality_name?: string; // Locality name (optional)
  }