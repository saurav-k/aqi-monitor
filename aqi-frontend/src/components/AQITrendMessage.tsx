import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Descriptions, Statistic, Row, Col, List } from 'antd';
import { AQIData } from '../types/aqiData';
import { useTrackEventMutation } from '../api/api-tracking';
import './AQITrendMessage.css';

const { Text, Title } = Typography;

interface AQITrendMessageProps {
    data: AQIData[];
}

const calculateSlope = (data: AQIData[]) => {
    const n = data.length;
    // const sumX = data.reduce((sum, _, idx) => sum + idx, 0);
    // const sumY = data.reduce((sum, point) => sum + point.aqi_pm25, 0);
    // const sumXY = data.reduce((sum, point, idx) => sum + idx * point.aqi_pm25, 0);
    // const sumX2 = data.reduce((sum, _, idx) => sum + idx * idx, 0);
    const sumX = data.reduce((sum, _, idx) => sum + idx, 0);
    const sumY = data.reduce((sum, point) => sum + point.overall_aqi, 0);
    const sumXY = data.reduce((sum, point, idx) => sum + idx * point.overall_aqi, 0);
    const sumX2 = data.reduce((sum, _, idx) => sum + idx * idx, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

const AQITrendMessage: React.FC<AQITrendMessageProps> = ({ data }) => {
    const [trackEvent] = useTrackEventMutation();
    const containerRef = useRef<HTMLDivElement>(null);
    const [hasScrolled, setHasScrolled] = useState(false);

    useEffect(() => {
        if (hasScrolled) return;

        const handleScroll = () => {
            // Log the scroll event only once
            if (!hasScrolled) {
                trackEvent("scroll_aqi_trend_report" );
                setHasScrolled(true);
            }
        };

        const container = containerRef.current;
        container?.addEventListener("scroll", handleScroll);

        return () => {
            container?.removeEventListener("scroll", handleScroll);
        };
    }, [hasScrolled, trackEvent]);

    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - 30 * 60 * 1000;

    const recentData = data.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);

    if (recentData.length < 2) {
        return <Text>No sufficient data available to determine AQI trend.</Text>;
    }

    const slope = calculateSlope(recentData);
    const avgAQI = recentData.reduce((sum, point) => sum + point.overall_aqi, 0) / recentData.length;
    const maxAQI = Math.max(...recentData.map(point => point.overall_aqi));
    const minAQI = Math.min(...recentData.map(point => point.overall_aqi));
    const latestAQI = recentData[recentData.length - 1].overall_aqi;

    const trendText = slope < -0.4 ? "Improving" : slope > 0.4 ? "Worsening" : "Stable";
    const trendColor = slope < -0.4 ? "green" : slope > 0.4 ? "red" : "gray";

    return (
        <Card ref={containerRef} style={{ maxHeight: '500px', overflowY: 'scroll', textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <Title level={5} style={{ color: trendColor }} className="pulsing-trend-text">
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
                        <Text style={{ float: 'right' }}>{item.overall_aqi}</Text>
                    </List.Item>
                )}
                style={{ marginTop: '16px', textAlign: 'left' }}
            />
        </Card>
    );
};

export default AQITrendMessage;
