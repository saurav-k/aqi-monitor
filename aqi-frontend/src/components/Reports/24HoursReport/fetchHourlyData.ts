import dayjs, { Dayjs } from 'dayjs';
import apiClient from '../../../api/api-axios';
import zphs01bApiClient from '../../../api/zphs01b-axios';
import aqiApiClient from '../../../api/api-aqi-axios';
import { getWindDirectionReadable } from './windDirectionUtils';
import { reduceAndCalculateStats } from './utilityFunctions';

export interface HourlyData {
  startTime: string; // Start time of the hour
  endTime: string;   // End time of the hour
  dataPointCount: number; // Number of data points in this hour
  avgWindSpeed: number; // Average wind speed (km/h) for this hour
  avgAngle: number; // Average wind angle (degrees) for this hour
  vocDataCount?: number; // Count of VOC data where `voc === 3` (optional)
  windDirectionReadable?: string; // Human-readable wind direction (optional)
  minMaxAverage?: {}; // List of moving average AQI values (optional)
}

export const fetchHourlyData = async (selectedDate?: Dayjs): Promise<HourlyData[]> => {
  const now = dayjs().tz('Asia/Kolkata');
  const roundedDate = selectedDate 
    ? selectedDate.startOf('day') 
    : now.minute() >= 30 
      ? now.add(1, 'hour').startOf('hour') 
      : now.startOf('hour');

  const formattedData: HourlyData[] = [];

  for (let i = 0; i < 24; i++) {
    const startTime = roundedDate.subtract(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
    const endTime = roundedDate.subtract(i, 'hour').format('YYYY-MM-DDTHH:mm:ss');

    try {
      const weatherResponse = await apiClient.get('/weather_data_analysis', {
        params: { start_time: startTime, end_time: endTime },
      });

      const overallAverage = weatherResponse.data.find(
        (item: any) => item.wind_direction_readable === 'Overall Average'
      );

      if (overallAverage) {
        const vocResponse = await zphs01bApiClient.get('/zphs01b_data', {
          params: { start_time: startTime, end_time: endTime },
        });

        const vocDataCount = vocResponse.data.filter((item: any) => item.voc === 3).length;

        // Fetch AQI data for calculating sliding window averages
        const aqiResponse = await aqiApiClient.get('/aqi_data', {
          params: { start_time: startTime, end_time: endTime },
        });

        const aqiData = aqiResponse.data.map((item: any) => item.overall_aqi);

        // Calculate sliding window averages
        const minMaxAverage = reduceAndCalculateStats(aqiData);

        formattedData.push({
          startTime,
          endTime,
          dataPointCount: overallAverage.data_point_count,
          avgWindSpeed: overallAverage.avg_wind_speed_kmh,
          avgAngle: overallAverage.avg_angle,
          vocDataCount,
          windDirectionReadable: getWindDirectionReadable(overallAverage.avg_angle),
          minMaxAverage, // Add sliding window averages list
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${startTime} to ${endTime}:`, error);
    }
  }

  return formattedData;
};