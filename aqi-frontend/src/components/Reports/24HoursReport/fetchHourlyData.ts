import dayjs, { Dayjs } from 'dayjs';
import apiClient from '../../../api/api-axios';
import zphs01bApiClient from '../../../api/zphs01b-axios';
import { getWindDirectionReadable } from './windDirectionUtils';

export interface HourlyData {
  startTime: string;
  endTime: string;
  dataPointCount: number;
  avgWindSpeed: number;
  avgAngle: number;
  vocDataCount?: number; // Count of `voc === 3`
  windDirectionReadable?: string;
}

export const fetchHourlyData = async (selectedDate?: Dayjs): Promise<HourlyData[]> => {
  // Use the current timestamp (Asia/Kolkata timezone) and round it to the nearest hour if no date is provided
  const now = dayjs().tz('Asia/Kolkata');
  const roundedDate = selectedDate 
    ? selectedDate.startOf('day') 
    : (now.minute() >= 30 ? now.add(1, 'hour').startOf('hour') : now.startOf('hour'));

  const formattedData: HourlyData[] = [];

  for (let i = 0; i < 24; i++) {
    const startTime = roundedDate.subtract(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');
    const endTime = roundedDate.subtract(i, 'hour').format('YYYY-MM-DDTHH:mm:ss');

    try {
      // Fetch weather data
      const weatherResponse = await apiClient.get('/weather_data_analysis', {
        params: { start_time: startTime, end_time: endTime },
      });

      const overallAverage = weatherResponse.data.find(
        (item: any) => item.wind_direction_readable === 'Overall Average'
      );

      if (overallAverage) {
        // Fetch VOC data for the same hour
        const vocResponse = await zphs01bApiClient.get('/zphs01b_data', {
          params: { start_time: startTime, end_time: endTime },
        });

        const vocDataCount = vocResponse.data.filter((item: any) => item.voc === 3).length;

        // Add to formatted data
        formattedData.push({
          startTime,
          endTime,
          dataPointCount: overallAverage.data_point_count,
          avgWindSpeed: overallAverage.avg_wind_speed_kmh,
          avgAngle: overallAverage.avg_angle,
          vocDataCount,
          windDirectionReadable: getWindDirectionReadable(overallAverage.avg_angle),
        });
      }
    } catch (error) {
      console.error(`Error fetching data for ${startTime} to ${endTime}:`, error);
    }
  }

  return formattedData;
};
