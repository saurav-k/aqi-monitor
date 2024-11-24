import React, { useState } from 'react';
import { Button, Spin, Typography, Table, message } from 'antd';
import dayjs from 'dayjs';
import apiClient from '../../../api/api-axios';

const { Title } = Typography;

const Last24HoursReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<
    { startTime: string; endTime: string; dataPointCount: number; avgWindSpeed: number; avgAngle: number }[]
  >([]);

  const fetchLast24HoursData = async () => {
    setLoading(true);
    const now = dayjs().tz('Asia/Kolkata'); // Current time
    // Round to the nearest hour
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

  const columns = [
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'), // Human-readable format
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'), // Human-readable format
    },
    {
      title: 'Data Points',
      dataIndex: 'dataPointCount',
      key: 'dataPointCount',
    },
    {
      title: 'Average Wind Speed (km/h)',
      dataIndex: 'avgWindSpeed',
      key: 'avgWindSpeed',
      render: (value: number) => `${value.toFixed(2)} km/h`,
    },
    {
      title: 'Average Angle (°)',
      dataIndex: 'avgAngle',
      key: 'avgAngle',
      render: (value: number) => (
        <span style={{ color: value >= -20 && value <= 45 ? 'red' : 'inherit' }}>
          {value.toFixed(2)}°
        </span>
      ),
    },
  ];

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
        <Table
          columns={columns}
          dataSource={hourlyAverages}
          rowKey={(record) => `${record.startTime}-${record.endTime}`}
          pagination={false}
        />
      )}
    </div>
  );
};

export default Last24HoursReport;
