import React, { useState, useEffect } from 'react';
import { Typography, Spin } from 'antd';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';
import OverallAverage from './OverallAverage';
import DownloadButton from './DownloadButton';
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

  return (
    <div style={{ padding: '5px' }}>
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
          <OverallAverage overallAverage={overallAverage} />
          <DownloadButton data={data || []} />
        </div>
      )}
    </div>
  );
};

export default WindReport;
