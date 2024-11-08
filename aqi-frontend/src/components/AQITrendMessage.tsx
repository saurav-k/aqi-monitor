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
    const { data: vocData, isLoading: isVocLoading } = useGetZPHS01BDataQuery({ limit: 3 });
    const vocAverage = vocData && vocData.length > 0
        ? vocData.reduce((sum, item) => sum + item.voc, 0) / vocData.length
        : 0;

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

    // VOC-specific text and color based on average VOC
    const vocText = vocAverage >= 3 ? "High VOC Levels" : vocAverage >= 2 ? "Moderate VOC Levels" : vocAverage >= 1 ? "Minor VOC Levels" : "Safe VOC Levels";
    const vocColor = vocAverage >= 3 ? "maroon" : vocAverage >= 2 ? "yellow" : vocAverage >= 1 ? "orange" : "green";

    // Slope-specific text and color
    const slopeText = slope > 3 ? "Hazardous Worsening" : slope < -0.4 ? "Improving" : slope > 0.8 ? "Worsening" : slope > 0.4 ? "Slightly Going Bad" : "Stable";
    const slopeColor = slope > 3 ? "maroon" : slope < -0.4 ? "green" : slope > 0.8 ? "red" : slope > 0.4 ? "orange" : "gray";

    return (
        <Card ref={containerRef} style={{ maxHeight: '500px', overflowY: 'scroll', textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            {/* VOC Trend */}
            <Title level={5} style={{ color: vocColor }} className="pulsing-trend-text">
                {vocText} : {vocAverage.toFixed(2)}
            </Title>
            <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                VOC Level Status
            </Text>

            {/* Slope Trend */}
            <Title level={5} style={{ color: slopeColor }} className="pulsing-trend-text">
                AQI is {slopeText}
            </Title>
            <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                AQI Trend based on the last 30 minutes of data
            </Text>

            {vocAverage >= 0 && !isVocLoading && (
                <Alert
                    message={
                        vocAverage === 0
                            ? "VOC is not present"
                            : `VOC Alert - ${vocAverage < 2 ? "Detected" : "High"}`
                    }
                    description={
                        vocAverage === 0
                            ? "VOC level is within safe limits."
                            : vocAverage < 2
                            ? "VOC is detected, suggesting minimal to moderate air quality concerns."
                            : "VOC level is high, indicating significant air quality concerns. Immediate action is advised."
                    }
                    type={vocAverage === 0 ? "success" : vocAverage < 2 ? "warning" : "error"}
                    showIcon
                    style={{
                        backgroundColor: vocAverage === 0 ? "#D4EDDA" : vocAverage < 2 ? "#FFF3CD" : "#F8D7DA",
                        borderColor: vocAverage === 0 ? "#C3E6CB" : vocAverage < 2 ? "#FFEEBA" : "#F5C6CB",
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
