import React, { useState } from 'react';
import { DatePicker, Button, Typography, message } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';
import { generateHTMLDoc, WeatherReport } from './reportUtils';

const { Title } = Typography;

const GenerateReport: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHourlyData = async (startTime: string, endTime: string) => {
    try {
      const response = await axios.get('https://www.tridasa.online/api/weather_data_analysis', {
        params: { start_time: startTime, end_time: endTime },
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch data for ${startTime} - ${endTime}:`, error);
      return [];
    }
  };

  const generateHourlyDataReport = async () => {
    if (!selectedDate) {
      message.error('Please select a date!');
      return;
    }

    setIsLoading(true);
    const date = dayjs(selectedDate).format('YYYY-MM-DD');
    const consolidatedData: WeatherReport[] = [];

    try {
      for (let hour = 0; hour < 24; hour++) {
        const startTime = dayjs(`${date}T${hour.toString().padStart(2, '0')}:00:00`).format('YYYY-MM-DDTHH:mm:ss');
        const endTime = dayjs(`${date}T${(hour + 1).toString().padStart(2, '0')}:00:00`).format('YYYY-MM-DDTHH:mm:ss');

        const data = await fetchHourlyData(startTime, endTime);
        if (data && data.length > 0) {
          consolidatedData.push(
            ...data.map((item: WeatherReport) => ({
              hour: `${hour}:00 - ${hour + 1}:00`,
              ...item,
            }))
          );
        }
      }

      generateHTMLDoc(consolidatedData, date);
    } catch (error) {
      message.error('Failed to generate report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '5px' }}>
      <Title level={4}>Generate Weather Report</Title>
      <DatePicker
        onChange={(date) => setSelectedDate(date ? date.format('YYYY-MM-DD') : null)}
        format="YYYY-MM-DD"
        style={{ marginBottom: '5px' }}
      />
      <br />
      <Button type="primary" onClick={generateHourlyDataReport} loading={isLoading}>
        Generate Report
      </Button>
    </div>
  );
};

export default GenerateReport;
