import React, { useState } from 'react';
import { Button, Spin, Typography, message } from 'antd';
import dayjs from 'dayjs';
import apiClient from '../../../api/api-axios';
import OverallAverage from './OverallAverage';

const { Title } = Typography;

const Last24HoursReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<
    { startTime: string; endTime: string; overallAverage: any }[]
  >([]);

  const fetchLast24HoursData = async () => {
    setLoading(true);
    const now = dayjs(); // Current time
    const formattedData: {
      startTime: string;
      endTime: string;
      overallAverage: any;
    }[] = [];

    try {
      for (let i = 0; i < 24; i++) {
        const endTime = now.subtract(i, 'hour').format('YYYY-MM-DDTHH:mm:ss'); // Format without milliseconds
        const startTime = now.subtract(i + 1, 'hour').format('YYYY-MM-DDTHH:mm:ss');

        const response = await apiClient.get('/weather_data_analysis', {
          params: { start_time: startTime, end_time: endTime },
        });

        const overallAverage = response.data.find(
          (item: any) => item.wind_direction_readable === 'Overall Average'
        );

        if (overallAverage) {
          formattedData.push({ startTime, endTime, overallAverage });
        }
      }

      setHourlyAverages(formattedData.reverse()); // Reverse to show earliest hour first
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
      <Button
        type="primary"
        onClick={fetchLast24HoursData}
        loading={loading}
        style={{ marginBottom: '20px' }}
      >
        Fetch Data
      </Button>
      {loading ? (
        <Spin tip="Loading hourly data..." />
      ) : (
        hourlyAverages.map((data, index) => (
          <OverallAverage
            key={index}
            overallAverage={data.overallAverage}
            startTime={data.startTime}
            endTime={data.endTime}
          />
        ))
      )}
    </div>
  );
};

export default Last24HoursReport;
