import React, { useState } from 'react';
import { Button, DatePicker, Spin, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import apiClient from '../../../api/api-axios';
import zphs01bApiClient from '../../../api/zphs01b-axios';
import ReportTable from './ReportTable';

const { Title } = Typography;

interface HourlyData {
  startTime: string;
  endTime: string;
  dataPointCount: number;
  avgWindSpeed: number;
  avgAngle: number;
  vocDataCount?: number; // Count of `voc === 3`
}

const Last24HoursReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<HourlyData[]>([]);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const fetchReportForSelectedDate = async () => {
    if (!selectedDate) {
      message.error('Please select a date to generate the report.');
      return;
    }

    setLoading(true);
    const startOfDay = selectedDate.startOf('day');
    const endOfDay = selectedDate.endOf('day');
    const formattedData: HourlyData[] = [];

    try {
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
          });
        }
      }

      setHourlyAverages(formattedData); // No reverse needed as we fetch sequentially
      message.success('Successfully fetched data for the selected date.');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data for the selected date.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '100vh' }}>
      <Title level={3} style={{ textAlign: 'center' }}>
        Generate Report for a Specific Date
      </Title>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <DatePicker onChange={handleDateChange} />
      </div>
      <Button
        type="primary"
        onClick={fetchReportForSelectedDate}
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
