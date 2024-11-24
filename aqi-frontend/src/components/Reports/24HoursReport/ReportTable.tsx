import React from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';

interface ReportTableProps {
  hourlyAverages: {
    startTime: string; // Start time of the hour
    endTime: string;   // End time of the hour
    dataPointCount: number; // Number of data points in this hour
    avgWindSpeed: number; // Average wind speed (km/h) for this hour
    avgAngle: number; // Average wind angle (degrees) for this hour
    vocDataCount?: number; // Count of VOC data where `voc === 3` (optional)
    windDirectionReadable?: string; // Human-readable wind direction (optional)
    minMaxAverage?: { }; // Array of moving averages (optional)
  }[];
}

const ReportTable: React.FC<ReportTableProps> = ({ hourlyAverages }) => {
  console.log("hourlyAverages");
  console.log(hourlyAverages);
  
  
  const columns = [
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'),
    },
    {
      title: 'Data Points',
      dataIndex: 'dataPointCount',
      key: 'dataPointCount',
      align: 'right' as const, // Correct align type
    },
    {
      title: 'Wind Direction',
      dataIndex: 'windDirectionReadable',
      key: 'windDirectionReadable',
    },
    {
      title: 'Average Wind Speed (km/h)',
      dataIndex: 'avgWindSpeed',
      key: 'avgWindSpeed',
      render: (value: number) => `${value.toFixed(2)} km/h`,
      align: 'right' as const,
    },
    {
      title: 'Average Angle (°)',
      dataIndex: 'avgAngle',
      key: 'avgAngle',
      render: (value: number) => (
        <span style={{ color: value >= -20 && value <= 45 ? 'red' : 'inherit' }}>
          {value.toFixed(2)}°
        </span>
      ),
      align: 'right' as const,
    },
    {
      title: 'VOC Data Count',
      dataIndex: 'vocDataCount',
      key: 'vocDataCount',
      render: (value: number) => (
        <span style={{ color: value >= 10 ? 'red' : 'inherit' }}>
          {value}
        </span>
      ),
      align: 'right' as const,
    },
    {
      title: 'Min Max Average (AQI)',
      dataIndex: 'minMaxAverage',
      key: 'minMaxAverage',
      render: (value: { min: number; average: number; max: number } | undefined) => {
        if (value) {
          return `Min: ${value.min.toFixed(2)}, Max: ${value.max.toFixed(2)}, Avg: ${value.average.toFixed(2)}`;
        } else {
          return 'N/A';
        }
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={hourlyAverages}
      rowKey={(record) => `${record.startTime}-${record.endTime}`}
      pagination={{ pageSize: 100 }}
    />
  );
};

export default ReportTable;
