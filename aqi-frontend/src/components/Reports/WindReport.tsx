import React, { useState, useEffect } from 'react';
import { useGetWeatherDataAnalysisQuery } from '../../api/weatherDataApi';
import { Table, DatePicker, Button, Typography, Space, Spin, Modal } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WindReport: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [appliedStartTime, setAppliedStartTime] = useState<string>('');
  const [appliedEndTime, setAppliedEndTime] = useState<string>('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const now = dayjs().tz('Asia/Kolkata'); // Current time in GMT+5:30

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
    { skip: !appliedStartTime || !appliedEndTime } // Skip the query if not submitted
  );

    const handleRangeChange = (
      dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null,
      dateStrings: [string, string]
    ) => {
      if (dates && dates[0] && dates[1]) {
        const rangeStart = dates[0];
        const rangeEnd = dates[1];
    
        if (rangeEnd.diff(rangeStart, 'hour') > 24) {
          setIsModalVisible(true); // Show modal if range exceeds 24 hours
        } else {
          // Update startTime and endTime if the range is valid
          setStartTime(`${rangeStart.format('YYYY-MM-DDTHH:mm')}:00`);
          setEndTime(`${rangeEnd.format('YYYY-MM-DDTHH:mm')}:00`);
        }
      }
    };
  

  const handleSubmit = () => {
    const start = dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss');
    const end = dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss');
    const duration = end.diff(start, 'hour');

    // Validate the date range
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

    // Apply the selected range for the API call
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
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Wind_Report_${new Date().toISOString()}.xlsx`);
  };

  const disabledDate = (current: dayjs.Dayjs) => current && current.isAfter(now, 'day');

  const disabledTime = (current: dayjs.Dayjs) => {
    const nowTime = now.toDate();
    return {
      disabledHours: () =>
        current && current.isSame(now, 'day')
          ? Array.from({ length: 24 }, (_, i) => i).filter((hour) => hour > nowTime.getHours())
          : [],
    };
  };

  const convertAngleToCardinal = (angle: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(angle / 22.5) % 16;
    return directions[index];
  };

  const overallAverage = data?.find((item) => item.wind_direction_readable === 'Overall Average');

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
      render: (value: number) => `${value.toFixed(2)}° (${convertAngleToCardinal(value)})`,
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
              dayjs(startTime, 'YYYY-MM-DDTHH:mm:ss'),
              dayjs(endTime, 'YYYY-MM-DDTHH:mm:ss'),
            ]}
            onChange={handleRangeChange}
            disabledDate={disabledDate}
            disabledTime={disabledTime}
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
        <p>Error loading data.</p>
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
            <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
              <Title level={4}>Overall Average</Title>
              <p>
                <strong>Data Points:</strong> {overallAverage.data_point_count}
              </p>
              <p>
                <strong>Percentage:</strong> {overallAverage.percentage.toFixed(2)}%
              </p>
              <p>
                <strong>Average Wind Speed:</strong> {overallAverage.avg_wind_speed_kmh.toFixed(2)} km/h
              </p>
              <p>
                <strong>Average Angle:</strong> {overallAverage.avg_angle.toFixed(2)}° (
                {convertAngleToCardinal(overallAverage.avg_angle)})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WindReport;
