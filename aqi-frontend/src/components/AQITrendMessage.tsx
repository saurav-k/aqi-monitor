// AQITrendMessage.tsx
import React from 'react';
import { Card, Typography, Descriptions, Statistic, Row, Col, List } from 'antd';
import { AQIData } from '../types/aqiData';

const { Text, Title } = Typography;

interface AQITrendMessageProps {
    data: AQIData[];
}

// Helper function to calculate slope
const calculateSlope = (data: AQIData[]) => {
    const n = data.length;
    const sumX = data.reduce((sum, _, idx) => sum + idx, 0); // Sum of indices as time points
    const sumY = data.reduce((sum, point) => sum + point.aqi_pm25, 0); // Sum of AQI values
    const sumXY = data.reduce((sum, point, idx) => sum + idx * point.aqi_pm25, 0); // Sum of index * AQI
    const sumX2 = data.reduce((sum, _, idx) => sum + idx * idx, 0); // Sum of index^2

    // Calculate the slope of the best-fit line (m)
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

const AQITrendMessage: React.FC<AQITrendMessageProps> = ({ data }) => {
    // Calculate cutoff time for the last 30 minutes
    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - 30 * 60 * 1000; // 30 minutes in milliseconds

    // Filter data to get only the entries from the last 30 minutes
    const recentData = data.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);

    if (recentData.length < 2) {
        return <Text>No sufficient data available to determine AQI trend.</Text>;
    }

    // Calculate additional details
    const slope = calculateSlope(recentData);
    const avgAQI = recentData.reduce((sum, point) => sum + ((point.aqi_pm25 + point.aqi_pm10) / 2), 0) / recentData.length;
    const maxAQI = Math.max(...recentData.map(point => (point.aqi_pm25 + point.aqi_pm10) / 2));
    const minAQI = Math.min(...recentData.map(point => (point.aqi_pm25 + point.aqi_pm10) / 2));
    const latestAQI = (recentData[recentData.length - 1].aqi_pm25 + recentData[recentData.length - 1].aqi_pm10) / 2;

    // Interpret the trend
    // const trendText = slope < -0.1 ? "Improving" : slope > 0.1 ? "Worsening" : "Stable";
    // const trendColor = slope < -0.1 ? "green" : slope > 0.1 ? "red" : "gray";
    // Interpret the trend
    const trendText =
    slope < -0.2 ? "Improving" :
    slope > 0.2 ? "Worsening" :
    "Stable";
    const trendColor =
    slope < -0.2 ? "green" :
    slope > 0.2 ? "red" :
    "gray";

    return (
        <Card style={{ textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <Title level={5} style={{ color: trendColor }}>
                AQI is {trendText}
            </Title>
            <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                Trend based on the last 30 minutes of data
            </Text>

            <Descriptions bordered column={1} size="small" style={{ textAlign: 'left' }}>
                <Descriptions.Item label="Average AQI (30 mins)">
                    <Statistic value={avgAQI.toFixed(1)} />
                </Descriptions.Item>
                <Descriptions.Item label="Highest AQI (30 mins)">
                    <Statistic value={maxAQI} />
                </Descriptions.Item>
                <Descriptions.Item label="Lowest AQI (30 mins)">
                    <Statistic value={minAQI} />
                </Descriptions.Item>
                <Descriptions.Item label="Current AQI">
                    <Statistic value={latestAQI} />
                </Descriptions.Item>
            </Descriptions>

            <Row justify="center" style={{ marginTop: '16px' }}>
                <Col>
                    <Statistic title="Slope (Trend Rate)" value={slope.toFixed(2)} />
                </Col>
            </Row>

            <Title level={5} style={{ marginTop: '16px' }}>
                Analyzed Data Points ({recentData.length})
            </Title>
            <List
                bordered
                dataSource={recentData}
                renderItem={(item) => (
                    <List.Item>
                        <Text strong>{new Date(item.timestamp).toLocaleString()}</Text>
                        <Text style={{ float: 'right' }}>{( item.aqi_pm25 + item.aqi_pm10 )}</Text>
                    </List.Item>
                )}
                style={{ marginTop: '16px', textAlign: 'left' }}
            />
        </Card>
    );
};

export default AQITrendMessage;