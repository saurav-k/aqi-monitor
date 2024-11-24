import React from 'react';
import { Table } from 'antd';

interface DataTableProps {
  data: any[]; // Replace `any` with a more specific type if available
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
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
    <Table
      dataSource={data || []}
      columns={columns}
      rowKey={(record, index) => (index !== undefined ? index.toString() : '')}
      pagination={{ pageSize: 5 }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default DataTable;
