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
    const { data: vocData, isLoading: isVocLoading } = useGetZPHS01BDataQuery({ limit: 10 });
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
    // const vocText = vocAverage >= 3 ? "High VOC Levels" : vocAverage >= 2 ? "Moderate VOC Levels" : vocAverage >= 1 ? "Minor VOC Levels" : "Safe VOC Levels";
    // const vocColor = vocAverage >= 3 ? "maroon" : vocAverage >= 2 ? "yellow" : vocAverage >= 1 ? "orange" : "green";

        // Determine text and color based on VOC average
        const vocText = 
        vocAverage >= 3 ? "High VOC Levels" : 
        vocAverage >= 2 ? "Moderate VOC Levels" : 
        vocAverage >= 1 ? "Minor VOC Levels" : 
        "Safe VOC Levels";

    const vocColor = 
        vocAverage >= 3 ? "maroon" : 
        vocAverage >= 2 ? "darkorange" : 
        vocAverage >= 1 ? "gold" : 
        "lightgreen";

    // Determine Alert properties based on VOC average
    const alertMessage = 
        vocAverage === 0 ? "VOC is not present" : 
        `VOC Alert - ${vocAverage >= 3 ? "High" : "Detected"}`;

    const alertDescription = 
        vocAverage === 0 ? "VOC level is within safe limits." : 
        vocAverage < 1 ? "VOC level is safe" : 
        vocAverage < 2 ? "VOC level detected is moderate " : 
        vocAverage < 3 ? "VOC level detected is high, " : 
        "VOC level detected, indicating some air quality concerns.";

    const alertType = 
        vocAverage === 0 ? "success" : 
        vocAverage < 2 ? "warning" : 
        vocAverage < 3 ? "warning" : 
        "error";

    const alertBackgroundColor = 
        vocAverage === 0 ? "#D4EDDA" : 
        vocAverage < 1 ? "#E8F5E9" : 
        vocAverage < 2 ? "#FFF9C4" : 
        vocAverage < 3 ? "#FFE0B2" : 
        "#FFCDD2";

    const alertBorderColor = 
        vocAverage === 0 ? "#C3E6CB" : 
        vocAverage < 1 ? "#AED581" : 
        vocAverage < 2 ? "#FFEEBA" : 
        vocAverage < 3 ? "#FFAB91" : 
        "#F5C6CB";

    // Slope-specific text and color
    const slopeText = slope > 3 ? "Hazardous Worsening" : slope < -0.4 ? "Improving" : slope > 0.8 ? "Worsening" : slope > 0.4 ? "Slightly Going Bad" : "Stable";
    const slopeColor = slope > 3 ? "maroon" : slope < -0.4 ? "green" : slope > 0.8 ? "red" : slope > 0.4 ? "orange" : "gray";

    const thresholds = [0, 50, 100, 150, 200, 300, 500];
    const colors = ['#a8e5a0', '#ffffb3', '#ffd699', '#ff9999', '#d79edb', '#e5b2b8'];

    const getAQIColor = (aqi: number) => {
        for (let i = 0; i < thresholds.length; i++) {
            if (aqi <= thresholds[i]) {
                return colors[i];
            }
        }
        return colors[colors.length - 1]; // Default to the last color if AQI exceeds all thresholds
    };
    const aqiColor = getAQIColor(avgAQI);

    return (
        <Card ref={containerRef} style={{ maxHeight: '500px', overflowY: 'scroll', textAlign: 'center', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
            {/* VOC Trend */}
            {/* <Title level={5} style={{ color: vocColor }} className="pulsing-trend-text">
                {vocText} : {vocAverage.toFixed(2)}
            </Title> */}
            {/* <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                VOC Level Status
            </Text> */}

            {/* Slope Trend */}
            <Title level={5} style={{ color: aqiColor }} className="pulsing-trend-text">
                AQI is {slopeText}
            </Title>
            <Text style={{ color: '#888888', display: 'block', marginBottom: '16px' }}>
                AQI Trend based on the last 30 minutes of data
            </Text>

            {vocAverage >= 0 && !isVocLoading && (
                <>
                    <Alert
                        message={alertMessage}
                        description={alertDescription}
                        type={alertType}
                        showIcon
                        style={{
                            backgroundColor: alertBackgroundColor,
                            borderColor: alertBorderColor,
                            marginBottom: '16px',
                        }}
                    />
                    <Title level={5} style={{ color: vocColor, textAlign: 'center' }}>
                    {vocText} : {vocAverage.toFixed(2)}
                    </Title>
                </>
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
