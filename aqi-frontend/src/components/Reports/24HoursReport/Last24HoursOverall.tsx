import React, { useState } from 'react';
import { Typography, message } from 'antd';
import dayjs from 'dayjs';
import apiClient from '../../../api/api-axios';
import FetchButton from './FetchButton';
import ReportTable from './ReportTable';
import LoadingSpinner from './LoadingSpinner';

const { Title } = Typography;

const Last24HoursReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<
    { startTime: string; endTime: string; dataPointCount: number; avgWindSpeed: number; avgAngle: number }[]
  >([]);

  const fetchLast24HoursData = async () => {
    setLoading(true);
    const now = dayjs().tz('Asia/Kolkata');
    const roundedNow = now.minute() >= 30 ? now.add(1, 'hour').startOf('hour') : now.startOf('hour');
    const formattedData: {
      startTime: string;
      endTime: string;
      dataPointCount: number;
      avgWindSpeed: number;
      avgAngle: number;
    }[] = [];

    try {
      for (let i = 0; i < 24; i++) {
        const endTime = roundedNow.subtract(i, 'hour').format('YYYY-MM-DDTHH:mm:ss');
        const startTime = roundedNow.subtract(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

        const response = await apiClient.get('/weather_data_analysis', {
          params: { start_time: startTime, end_time: endTime },
        });

        const overallAverage = response.data.find(
          (item: any) => item.wind_direction_readable === 'Overall Average'
        );

        if (overallAverage) {
          formattedData.push({
            startTime,
            endTime,
            dataPointCount: overallAverage.data_point_count,
            avgWindSpeed: overallAverage.avg_wind_speed_kmh,
            avgAngle: overallAverage.avg_angle,
          });
        }
      }

      setHourlyAverages(formattedData);
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
        Last 24 Hours Overall Averages
      </Title>
      <FetchButton onClick={fetchLast24HoursData} loading={loading} />
      {loading ? <LoadingSpinner /> : <ReportTable hourlyAverages={hourlyAverages} />}
    </div>
  );
};

export default Last24HoursReport;
