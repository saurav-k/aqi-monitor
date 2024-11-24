import React, { useState } from 'react';
import { Button, Spin, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import apiClient from '../../../api/api-axios';
import zphs01bApiClient from '../../../api/zphs01b-axios';
import ReportTable from './ReportTable';
import { getWindDirectionReadable } from './windDirectionUtils';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

interface HourlyData {
  startTime: string;
  endTime: string;
  dataPointCount: number;
  avgWindSpeed: number;
  avgAngle: number;
  vocDataCount?: number; // Count of `voc === 3`
  windDirectionReadable?: string;
}

const Last24HoursReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<HourlyData[]>([]);

  const generateReportForLast24Hours = async () => {
    setLoading(true);
    const now = dayjs().tz('Asia/Kolkata'); // Current time in Asia/Kolkata
    const roundedNow = now.minute() >= 30 ? now.add(1, 'hour').startOf('hour') : now.startOf('hour');
    const formattedData: HourlyData[] = [];

    try {
      for (let i = 0; i < 24; i++) {
        const endTime = roundedNow.subtract(i, 'hour').format('YYYY-MM-DDTHH:mm:ss');
        const startTime = roundedNow.subtract(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

        // Fetch weather data
        const weatherResponse = await apiClient.get('/weather_data_analysis', {
          params: { start_time: startTime, end_time: endTime },
        });

        const overallAverage = weatherResponse.data.find(
          (item: any) => item.wind_direction_readable === 'Overall Average'
        );

        let vocDataCount = 0;

        if (overallAverage) {
          // Fetch VOC data for the same hour
          const vocResponse = await zphs01bApiClient.get('/zphs01b_data', {
            params: { start_time: startTime, end_time: endTime },
          });

          // Count `voc === 3` in the response
          vocDataCount = vocResponse.data.filter((item: any) => item.voc === 3).length;

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
      }

      setHourlyAverages(formattedData); // No reverse needed as we fetch sequentially
      message.success('Successfully fetched data for the last 24 hours.');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data for the last 24 hours.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '100vh' }}>
      <Title level={3} style={{ textAlign: 'center' }}>
        Last 24 Hours Report
      </Title>
      <Button
        type="primary"
        onClick={generateReportForLast24Hours}
        loading={loading}
        style={{ marginBottom: '20px' }}
      >
        Generate Report
      </Button>
      {loading ? (
        <Spin tip="Loading hourly data..." />
      ) : (
        <ReportTable hourlyAverages={hourlyAverages} />
      )}
    </div>
  );
};

export default Last24HoursReport;
