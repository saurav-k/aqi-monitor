import React, { useEffect, useRef, useState } from 'react';
import { Card, Typography, Descriptions, Statistic, Row, Col, List, Alert } from 'antd';
import { AQIData } from '../types/aqiData';
import { useTrackEventMutation } from '../api/api-tracking';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi'; // Import the VOC API hook
import './AQITrendMessage.css';

const { Text, Title } = Typography;

interface AQITrendMessageProps {
    data: AQIData[];
}

const calculateSlope = (data: AQIData[]) => {
    const n = data.length;
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

    // Fetch VOC data using the API hook
    const { data: vocData, isLoading: isVocLoading } = useGetZPHS01BDataQuery({ limit: 1 });
    const voc = vocData && vocData.length > 0 ? vocData[0].voc : 0;

    useEffect(() => {
        if (hasScrolled) return;

        const handleScroll = () => {
            if (!hasScrolled) {
                trackEvent("scroll_aqi_trend_report");
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

    const trendText = 
    voc > 2 ? "Hazardous VOC Levels" : 
    voc >= 1 ? "Moderate VOC Levels" :  // Combined message for voc === 1 and voc === 2
    slope > 3 ? "Hazardous Worsening" : 
    slope < -0.4 ? "Improving" : 
    slope > 0.8 ? "Worsening" : 
    slope > 0.4 ? "Slightly Going Bad" : 
    "Stable";

const trendColor = 
    voc > 2 ? "darkred" : 
    voc >= 1 ? "orange" :  // Combined color for voc === 1 and voc === 2
    slope > 3 ? "maroon" : 
    slope < -0.4 ? "green" : 
    slope > 0.8 ? "red" : 
    slope > 0.4 ? "orange" : 
    "gray";

    return (
        <Card ref={containerRef} style={{ maxHeight: '500px', overflowY: 'scroll', textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            <Title level={5} style={{ color: trendColor }} className="pulsing-trend-text">
                AQI is {trendText}
            </Title>
            <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                Trend based on the last 30 minutes of data
            </Text>

            {voc >= 0 && !isVocLoading && (
                <Alert
                    message={
                        voc === 0
                            ? "VOC is not present"
                            : `VOC Alert - ${voc === 1 ? "detected" : voc === 2 ? "Moderate" : "High"}`
                    }
                    description={
                        voc === 0
                            ? "VOC level is  within safe limits."
                            : voc === 1
                            ? "VOC  is detected, suggesting minimal air quality concerns. smell will start"
                            : voc === 2
                            ? "VOC level is Moderate, indicating some air quality concerns. smell will get strong"
                            : "VOC level is High, indicating high air quality. Immediate action is advised. smell will stay strong "
                    }
                    type={voc === 0 ? "success" : voc === 1 ? "info" : voc === 2 ? "warning" : "error"}
                    showIcon
                    style={{
                        backgroundColor: voc === 0 ? "#D4EDDA" : voc === 1 ? "#FFF3CD" : voc === 2 ? "#FFD966" : "#F8D7DA",
                        borderColor: voc === 0 ? "#C3E6CB" : voc === 1 ? "#FFEEBA" : voc === 2 ? "#FFC107" : "#F5C6CB",
                        marginBottom: '16px',
                    }}
                />
            )}

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
                dataSource={recentData.reverse()}
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
