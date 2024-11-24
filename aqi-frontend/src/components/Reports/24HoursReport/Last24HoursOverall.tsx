import React, { useState } from 'react';
import { Button, DatePicker, Spin, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import ReportTable from './ReportTable';
import { fetchHourlyData, HourlyData } from './fetchHourlyData';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

const Last24HoursReport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<HourlyData[]>([]);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const generateReport = async () => {
    setLoading(true);

    try {
      // Determine the date to use for the report
      const dateToUse = selectedDate || dayjs().tz('Asia/Kolkata');
      const roundedDate = dateToUse.minute() >= 30 ? dateToUse.add(1, 'hour').startOf('hour') : dateToUse.startOf('hour');

      // Fetch hourly data
      const formattedData = await fetchHourlyData(roundedDate);

      setHourlyAverages(formattedData);
      message.success('Successfully generated the report.');
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate the report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '100vh' }}>
      <Title level={3} style={{ textAlign: 'center' }}>
        Last 24 Hours Report
      </Title>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <DatePicker
          onChange={handleDateChange}
          placeholder="Select a date (optional)"
          format="YYYY-MM-DD"
        />
      </div>
      <Button
        type="primary"
        onClick={generateReport}
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
