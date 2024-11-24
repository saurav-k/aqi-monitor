import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

interface OverallAverageProps {
  overallAverage: {
    data_point_count: number;
    percentage: number;
    avg_wind_speed_kmh: number;
    avg_angle: number;
  } | null;
}

const OverallAverage: React.FC<OverallAverageProps> = ({ overallAverage }) => {
  if (!overallAverage) {
    return null;
  }

  return (
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
  );
};

export default OverallAverage;
