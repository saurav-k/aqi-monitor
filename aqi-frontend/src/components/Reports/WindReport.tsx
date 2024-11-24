import React, { useState, useEffect } from 'react';
import { useGetWeatherDataAnalysisQuery } from '../../api/weatherDataApi';
import { Table, DatePicker, Button, Typography, Space, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WindReport: React.FC = () => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // Set current time and last minute as default
  useEffect(() => {
    const now = new Date();
    const offsetIST = 5 * 60 * 60 * 1000 + 30 * 60 * 1000; // 5 hours and 30 minutes in milliseconds
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000 + offsetIST); // Adjust to IST
    const nowIST = new Date(now.getTime() + offsetIST); // Adjust to IST
    
    setEndTime(nowIST.toISOString().slice(0, 19)); // Format: YYYY-MM-DDTHH:mm:ss
    setStartTime(oneHourAgo.toISOString().slice(0, 19));
  }, []);

  const { data, error, isLoading } = useGetWeatherDataAnalysisQuery({
    start_time: startTime,
    end_time: endTime,
  });

  // Function to convert angle to cardinal direction
  const convertAngleToCardinal = (angle: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(angle / 22.5) % 16;
    return directions[index];
  };

  const overallAverage = data?.find((item) => item.wind_direction_readable === 'Overall Average');

  // Table columns for Ant Design Table
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

  // Handle downloading data as Excel
  const handleDownload = () => {
    if (!data) return;
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wind Report');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `Wind_Report_${new Date().toISOString()}.xlsx`);
  };

  return (
    <div style={{ padding: '5px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>
        Wind Report
      </Title>

      <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
        <RangePicker
          showTime
          format="YYYY-MM-DDTHH:mm:ss"
          onChange={(values) => {
            if (values && values.length === 2) {
              setStartTime(values[0]?.toISOString().slice(0, 19) || '');
              setEndTime(values[1]?.toISOString().slice(0, 19) || '');
            }
          }}
        />
        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownload}>
          Download Report
        </Button>
      </Space>

      {isLoading ? (
        <Spin tip="Loading..." />
      ) : error ? (
        <p>Error loading data.</p>
      ) : (
        <div>
            <Table
            dataSource={data || []}
            columns={columns}
            rowKey={(record, index) => (index !== undefined ? index.toString() : '')} // Fallback for undefined index
            pagination={{ pageSize: 5 }}
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
