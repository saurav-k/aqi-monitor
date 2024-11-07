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
  