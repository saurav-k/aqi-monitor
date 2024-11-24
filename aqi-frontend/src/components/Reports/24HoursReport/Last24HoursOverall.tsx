import React, { useState } from 'react';
import { Button, DatePicker, Spin, Typography, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { fetchHourlyData } from './fetchHourlyData';
import ReportTable from './ReportTable';

const { Title } = Typography;

const Last24HoursReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState([]);

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
  };

  const generateReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date to generate the report.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchHourlyData(selectedDate);
      setHourlyAverages(data);
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
