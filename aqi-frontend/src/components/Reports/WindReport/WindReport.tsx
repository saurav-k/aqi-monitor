import React, { useState, useEffect, useRef } from 'react';
import { Typography, Spin } from 'antd';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';
import OverallAverage from './OverallAverage';
import DownloadButton from './DownloadButton';
import GenerateReport from './GenerateReport';
import { useGetWeatherDataAnalysisQuery } from '../../../api/weatherDataApi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

const WindReport: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [appliedStartTime, setAppliedStartTime] = useState<string>('');
  const [appliedEndTime, setAppliedEndTime] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Reference to OverallAverage section
  const overallAverageRef = useRef<HTMLDivElement | null>(null);

  // Initialize current time in the Asia/Kolkata timezone
  useEffect(() => {
    const now = dayjs().tz('Asia/Kolkata');
    const oneHourAgo = now.subtract(1, 'hour');
    setStartTime(oneHourAgo.format('YYYY-MM-DDTHH:mm:ss'));
    setEndTime(now.format('YYYY-MM-DDTHH:mm:ss'));
    setAppliedStartTime(oneHourAgo.format('YYYY-MM-DDTHH:mm:ss'));
    setAppliedEndTime(now.format('YYYY-MM-DDTHH:mm:ss'));
  }, []);

  const { data, error, isLoading } = useGetWeatherDataAnalysisQuery(
    {
      start_time: appliedStartTime,
      end_time: appliedEndTime,
    },
    { skip: !appliedStartTime || !appliedEndTime }
  );

  const overallAverage = data?.find((item) => item.wind_direction_readable === 'Overall Average') || null;

  // Scroll to OverallAverage section when data changes
  useEffect(() => {
    if (data && overallAverageRef.current) {
      overallAverageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data]);

  return (
    <div style={{ padding: '5px', overflowY: 'auto', maxHeight: '100vh' }}>
      <DateRangePicker
        startTime={startTime}
        endTime={endTime}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        onSubmit={() => {
          setAppliedStartTime(startTime);
          setAppliedEndTime(endTime);
        }}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />

      {isLoading ? (
        <Spin tip="Loading..." />
      ) : error ? (
        <Typography.Text type="danger">Error loading data.</Typography.Text>
      ) : (
        <div>
          <DataTable data={data || []} />
          <DownloadButton
            data={data || []}
            startTime={appliedStartTime}
            endTime={appliedEndTime}
          />
          <div ref={overallAverageRef}>
          <OverallAverage
            overallAverage={overallAverage}
            startTime={appliedStartTime}
            endTime={appliedEndTime}
          />
          </div>
        </div>
      )}
      <GenerateReport/>
    </div>
  );
};

export default WindReport;
