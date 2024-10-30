// AQITrendMessage.tsx
import React from 'react';
import { Card, Typography } from 'antd';
import { AQIData } from '../types/aqiData';

const { Text, Title } = Typography;

interface AQITrendMessageProps {
    data: AQIData[];
}

// Helper function to calculate slope
const calculateSlope = (data: AQIData[]) => {
    const n = data.length;
    const sumX = data.reduce((sum, point, idx) => sum + idx, 0); // Sum of indices as time points
    const sumY = data.reduce((sum, point) => sum + point.aqi_pm25, 0); // Sum of AQI values
    const sumXY = data.reduce((sum, point, idx) => sum + idx * point.aqi_pm25, 0); // Sum of index * AQI
    const sumX2 = data.reduce((sum, _, idx) => sum + idx * idx, 0); // Sum of index^2

    // Calculate the slope of the best-fit line (m)
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

const AQITrendMessage: React.FC<AQITrendMessageProps> = ({ data }) => {
    // Filter data for the last 30 minutes
    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - 30 * 60 * 1000;
    const recentData = data.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);

    if (recentData.length < 2) {
        return <Text>No sufficient data available to determine AQI trend.</Text>;
    }

    // Calculate the slope
    const slope = calculateSlope(recentData);

    // Interpret the slope to determine the trend
    const trendText = slope < -0.1 ? "Improving" : slope > 0.1 ? "Worsening" : "Stable";
    const trendColor = slope < -0.1 ? "green" : slope > 0.1 ? "red" : "gray";

    return (
        <Card style={{ textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <Title level={5} style={{ color: trendColor }}>
                AQI is {trendText}
            </Title>
            <Text style={{ color: '#888888' }}>
                Trend based on the last 30 minutes of data
            </Text>
        </Card>
    );
};

export default AQITrendMessage;