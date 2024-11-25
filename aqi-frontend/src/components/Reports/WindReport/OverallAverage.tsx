import React from 'react';
import { Card, Space, Typography } from 'antd';
import { getWindDirectionReadable } from '../24HoursReport/windDirectionUtils';

const { Title, Text } = Typography;

interface OverallAverageProps {
  overallAverage: {
    data_point_count: number;
    percentage: number;
    avg_wind_speed_kmh: number;
    avg_angle: number;
  } | null;
  startTime: string;
  endTime: string;
}

const OverallAverage: React.FC<OverallAverageProps> = ({ overallAverage, startTime, endTime }) => {
  if (!overallAverage) {
    return null;
  }

  return (
    <Card style={{ marginTop: '20px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <Title level={4}>Overall Average</Title>
      <Text>
        <strong>Start Time:</strong> {startTime}
      </Text>
      <br />
      <Text>
        <strong>End Time:</strong> {endTime}
      </Text>
      <br />
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
        <strong>Average Angle: </strong> {overallAverage.avg_angle.toFixed(2)}°
      </Text>
      <Text>
        <strong>Wind direction: </strong> {getWindDirectionReadable(overallAverage.avg_angle)}
      </Text>
    </Card>
  );
};

export default OverallAverage;
