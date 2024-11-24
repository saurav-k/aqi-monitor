import React from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';

interface ReportTableProps {
  hourlyAverages: {
    startTime: string; // Start time of the hour
    endTime: string;   // End time of the hour
    dataPointCount: number; // Number of data points in this hour
    avgWindSpeed: number; // Average wind speed (km/h) for this hour
    avgAngle: number; // Average wind angle (degrees) for this hour
    vocDataCount?: number; // Count of VOC data where `voc === 3` (optional)
    windDirectionReadable?: string; // Human-readable wind direction (optional)
    slidingWindowAverages?: number[]; // Array of moving averages (optional)
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
      render: (value: number | undefined) => value ?? 'N/A',
      align: 'right' as const,
    },
    {
      title: 'Moving Avg (AQI)',
      dataIndex: 'slidingWindowAverages',
      key: 'slidingWindowAverages',
      render: (values: number[] | undefined) =>
        values && values.length > 0 ? (
          <Line
            data={{
              labels: values.map((_, index) => `Point ${index + 1}`),
              datasets: [
                {
                  label: 'AQI Moving Avg',
                  data: values,
                  borderColor: 'rgba(75, 192, 192, 1)',
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { display: false }, grid: { display: false } },
                y: { grid: { display: false } },
              },
              plugins: { legend: { display: false } },
            }}
            height={50}
            width={150}
          />
        ) : (
          'N/A'
        ),
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
