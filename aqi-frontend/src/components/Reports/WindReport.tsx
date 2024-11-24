import React, { useState, useEffect } from 'react';
import { useGetWeatherDataAnalysisQuery } from '../../api/weatherDataApi';
import { Table, DatePicker, Button, Typography, Space, Spin, Modal, Card } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const WindReport: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [appliedStartTime, setAppliedStartTime] = useState<string>('');
  const [appliedEndTime, setAppliedEndTime] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const now = dayjs().tz('Asia/Kolkata');

  // Set default time range (last hour)
  useEffect(() => {
    const oneHourAgo = now.subtract(1, 'hour');
    setStartTime(oneHourAgo.format('YYYY-MM-DDTHH:mm:ss'));
    setEndTime(now.format('YYYY-MM-DDTHH:mm:ss'));
    setAppliedStartTime(oneHourAgo.format('YYYY-MM-DDTHH:mm:ss'));
    setAppliedEndTime(now.format('YYYY-MM-DDTHH:mm:ss'));
  }, [now]);

  const { data, error, isLoading } = useGetWeatherDataAnalysisQuery(
    {
      start_time: appliedStartTime,
      end_time: appliedEndTime,
    },
    { skip: !appliedStartTime || !appliedEndTime }
  );

  const handleRangeChange = (
    dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    if (dates && dates[0] && dates[1]) {
      const rangeStart = dates[0];
      const rangeEnd = dates[1];

      if (rangeEnd.diff(rangeStart, 'hour') > 24) {
        setIsModalVisible(true);
      } else {
        setStartTime(`${rangeStart.format('YYYY-MM-DDTHH:mm')}:00`);
        setEndTime(`${rangeEnd.format('YYYY-MM-DDTHH:mm')}:00`);
      }
    } else {
      setStartTime('');
      setEndTime('');
    }
  };

  const handleSubmit = () => {
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const end = dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss');
    const duration = end.diff(start, 'hour');

    if (start.isAfter(end)) {
      Modal.error({
        title: 'Invalid Time Range',
        content: 'Start time must be before end time.',
      });
      return;
    }

    if (duration > 24) {
      Modal.warning({
        title: 'Range Limit Exceeded',
        content: 'You can only select a range of up to 24 hours.',
      });
      return;
    }

    setAppliedStartTime(startTime);
    setAppliedEndTime(endTime);
  };

  const handleDownload = () => {
    if (!data) {
      Modal.info({
        title: 'No Data Available',
        content: 'No data available to download. Please fetch data first.',
      });
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wind Report');
    XLSX.writeFile(workbook, 'Wind_Report.xlsx');
  };

  const disabledStartDate = (current: dayjs.Dayjs | null): boolean => {
    const now = dayjs().tz('Asia/Kolkata');
    return current ? current.isAfter(now, 'minute') : false;
  };

  const disabledEndDate = (current: dayjs.Dayjs | null): boolean => {
    if (!current || !startTime) return false;
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const maxEnd = start.add(24, 'hour');
    return current.isBefore(start, 'minute') || current.isAfter(maxEnd, 'minute');
  };

  const disabledEndTime = (selectedEnd: dayjs.Dayjs | null) => {
    if (!selectedEnd || !startTime) return {};
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const maxEnd = start.add(24, 'hour');

    const disabledHours = selectedEnd.isSame(maxEnd, 'day')
      ? Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour > maxEnd.hour())
      : [];
    const disabledMinutes = selectedEnd.isSame(maxEnd, 'hour')
      ? Array.from({ length: 60 }, (_, i) => i).filter((minute) => minute > maxEnd.minute())
      : [];

    return {
      disabledHours: () => disabledHours,
      disabledMinutes: () => disabledMinutes,
    };
  };

  const overallAverage = data?.find((item) => item.wind_direction_readable === 'Overall Average') || null;

  const columns = [
    {
      title: 'Start Time',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (text: string | null) => text || 'N/A',
    },
    {
      title: 'End Time',
      dataIndex: 'end_time',
      key: 'end_time',
      render: (text: string | null) => text || 'N/A',
    },
    {
      title: 'Wind Direction',
      dataIndex: 'wind_direction_readable',
      key: 'wind_direction_readable',
    },
    {
      title: 'Data Points',
      dataIndex: 'data_point_count',
      key: 'data_point_count',
    },
    {
      title: 'Percentage (%)',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Avg Wind Speed (km/h)',
      dataIndex: 'avg_wind_speed_kmh',
      key: 'avg_wind_speed_kmh',
      render: (value: number) => value.toFixed(2),
    },
    {
      title: 'Avg Angle',
      dataIndex: 'avg_angle',
      key: 'avg_angle',
      render: (value: number) => `${value.toFixed(2)}°`,
    },
  ];

  return (
    <div style={{ padding: '5px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Wind Report
      </Title>

      <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
        <RangePicker
          showTime
          format="YYYY-MM-DDTHH:mm"
          value={[
            startTime ? dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss') : null,
            endTime ? dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss') : null,
          ]}
          onChange={handleRangeChange}
          disabledDate={(current) =>
            startTime
              ? disabledEndDate(current)
              : disabledStartDate(current)
          }
          disabledTime={(current) =>
            startTime
              ? disabledEndTime(current)
              : {}
          }
        />
        <Space>
          <Button type="primary" onClick={handleSubmit}>
            Submit
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
            Download Report
          </Button>
        </Space>
      </Space>

      <Modal
        title="Range Limit Exceeded"
        visible={isModalVisible}
        onOk={() => setIsModalVisible(false)}
        onCancel={() => setIsModalVisible(false)}
      >
        <p>You can only select a range of up to 24 hours.</p>
      </Modal>

      {isLoading ? (
        <Spin tip="Loading..." />
      ) : error ? (
        <Text type="danger">Error loading data.</Text>
      ) : (
        <div>
          <Table
            dataSource={data || []}
            columns={columns}
            rowKey={(record, index) => (index !== undefined ? index.toString() : '')}
            pagination={{ pageSize: 5 }}
            scroll={{ x: 'max-content' }}
          />

          {overallAverage && (
            <Card style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
              <Title level={4}>Overall Average</Title>
              <Text>
                <strong>Data Points:</strong> {overallAverage.data_point_count}
              </Text>
              <br />
              <Text>
                <strong>Percentage:</strong> {overallAverage.percentage.toFixed(2)}%
              </Text>
              <br />
              <Text>
                <strong>Average Wind Speed:</strong> {overallAverage.avg_wind_speed_kmh.toFixed(2)} km/h
              </Text>
              <br />
              <Text>
                <strong>Average Angle:</strong> {overallAverage.avg_angle.toFixed(2)}°
              </Text>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default WindReport;
