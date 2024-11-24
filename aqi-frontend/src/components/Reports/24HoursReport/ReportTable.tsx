import React from 'react';
import { Table } from 'antd';
import dayjs from 'dayjs';

interface ReportTableProps {
  hourlyAverages: {
    startTime: string;
    endTime: string;
    dataPointCount: number;
    avgWindSpeed: number;
    avgAngle: number;
    vocDataCount?: number;
  }[];
}

const ReportTable: React.FC<ReportTableProps> = ({ hourlyAverages }) => {
  const columns = [
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'), // Human-readable format
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (value: string) => dayjs(value).format('MMM DD, YYYY HH:mm A'), // Human-readable format
    },
    {
      title: 'Data Points',
      dataIndex: 'dataPointCount',
      key: 'dataPointCount',
    },
    {
      title: 'Average Wind Speed (km/h)',
      dataIndex: 'avgWindSpeed',
      key: 'avgWindSpeed',
      render: (value: number) => `${value.toFixed(2)} km/h`,
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
    },
    {
      title: 'VOC Data Points',
      dataIndex: 'vocDataCount',
      key: 'vocDataCount',
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={hourlyAverages}
      rowKey={(record) => `${record.startTime}-${record.endTime}`}
      pagination={false}
    />
  );
};

export default ReportTable;
