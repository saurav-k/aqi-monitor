import React, { useState, useEffect, useRef } from 'react';
import { Typography, Spin, Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';
import DateRangePicker from './DateRangePicker';
import DataTable from './DataTable';
import OverallAverage from './OverallAverage';
import DownloadButton from './DownloadButton';
import GenerateReport from './GenerateReport';
import { useGetWeatherDataAnalysisQuery } from '../../../api/weatherDataApi';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import './WindReport.css';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;

const WindReport: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [appliedStartTime, setAppliedStartTime] = useState<string>('');
  const [appliedEndTime, setAppliedEndTime] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  // Show or hide Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>Wind Report</Title>
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
      <GenerateReport />
      {showBackToTop && (
        <Button
          type="primary"
          shape="circle"
          icon={<UpOutlined />}
          onClick={scrollToTop}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}
        />
      )}
    </div>
  );
};

export default WindReport;
