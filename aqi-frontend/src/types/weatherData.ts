export interface WeatherReport {
    start_time: string | null;
    end_time: string | null;
    wind_direction_readable: string;
    data_point_count: number;
    percentage: number;
    avg_wind_speed_kmh: number;
    avg_angle: number;
  }
  