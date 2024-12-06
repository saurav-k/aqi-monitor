// MobileAQISummary.tsx
import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { AQIData } from '../types/aqiData';
import AQILineChart from './charts/AQILineChart';
import VOCIndicatorCard from './VOCIndicatorCard'; // Import the new component


const { Title } = Typography;

interface Props {
    full_data: AQIData[];
    data: AQIData;
    averageOfLastFive: number;
}

const getAQIColors = () => [
    '#2E7D32', // Dark green for Good
    '#F9A825', // Dark yellow for Moderate
    '#EF6C00', // Dark orange for Unhealthy for Sensitive Groups
    '#D32F2F', // Dark red for Unhealthy
    '#7B1FA2', // Dark purple for Very Unhealthy
    '#4E342E', // Dark maroon for Hazardous
];

const AQI_THRESHOLDS = [60, 100, 150, 200, 300, 500];
const MAX_AQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];

const MobileAQISummary: React.FC<Props> = ({ full_data, data, averageOfLastFive }) => {
    const { pm25, pm10, aqi_pm25, aqi_pm10, timestamp } = data;
    const avgAQI = averageOfLastFive;
    const colors = getAQIColors();

    const dataConfig = {
        labels: ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Current AQI'],
        timestamp: timestamp,
        datasets: [
            {
                data: AQI_THRESHOLDS,
                backgroundColor: colors,
                borderWidth: 0,
                hoverBackgroundColor: colors,
                cutout: '80%',
            },
            {
                data: [avgAQI, MAX_AQI - avgAQI],
                backgroundColor: [
                    colors[AQI_THRESHOLDS.findIndex((threshold) => avgAQI <= threshold)],
                    '#e0e0e0',
                ],
                borderWidth: 0,
                hoverBackgroundColor: ['#e0e0e0', '#e0e0e0'],
                cutout: '90%',
            },
        ],
    };

    return (
        <Card style={{ padding: '2px' }}>
            <Row gutter={[8, 8]} justify="center" align="middle">
                <Col xs={24} sm={12} md={6}>
                    <AQILineChart
                        avgAQI={avgAQI}
                        timestamp={dataConfig.timestamp}
                        data={full_data}
                    />

                </Col>
                <Col xs={24} sm={12} md={6}>
                    <VOCIndicatorCard/> {/* New VOC card */}
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        bordered={false}
                        style={{
                            textAlign: 'center',
                            backgroundColor: '#e6f7ff',
                            padding: '10px',
                            borderRadius: '8px',
                        }}
                    >
                        <Title level={5}>{pm25} µg/m³</Title>
                        <Title level={5}>AQI Based on PM2.5 - {aqi_pm25}</Title>
                        <Title level={4}>Realtime PM2.5 in µg/m³</Title>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card
                        bordered={false}
                        style={{
                            textAlign: 'center',
                            backgroundColor: '#fffbe6',
                            padding: '10px',
                            borderRadius: '8px',
                        }}
                    >
                        <Title level={5}>{pm10} µg/m³</Title>
                        <Title level={5}>AQI Based on PM10 - {aqi_pm10}</Title>
                        <Title level={4}>Realtime PM10 in µg/m³</Title>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default MobileAQISummary;
