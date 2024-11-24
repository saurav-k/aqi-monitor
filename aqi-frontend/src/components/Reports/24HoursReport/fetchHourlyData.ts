import dayjs, { Dayjs } from 'dayjs';
import apiClient from '../../../api/api-axios';
import zphs01bApiClient from '../../../api/zphs01b-axios';

export interface HourlyData {
  startTime: string;
  endTime: string;
  dataPointCount: number;
  avgWindSpeed: number;
  avgAngle: number;
  vocDataCount?: number; // Count of `voc === 3`
}

export const fetchHourlyData = async (selectedDate: Dayjs): Promise<HourlyData[]> => {
  const startOfDay = selectedDate.startOf('day');
  const formattedData: HourlyData[] = [];

  for (let i = 0; i < 24; i++) {
    const startTime = startOfDay.add(i, 'hour').format('YYYY-MM-DDTHH:mm:ss');
    const endTime = startOfDay.add(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

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
      });
    }
  }

  return formattedData;
};
