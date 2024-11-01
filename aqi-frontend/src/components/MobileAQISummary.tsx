// MobileAQISummary.tsx
import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { ChartOptions } from 'chart.js';
import { AQIData } from '../types/aqiData';
import AQIDoughnutChart from './AQIDoughnutChart';

const { Title, Text } = Typography;

interface Props {
    data: AQIData;
}

// const getAQIColors = () => [
//     '#a8e5a0', // Good
//     '#ffffb3', // Moderate
//     '#ffd699', // Unhealthy for Sensitive Groups
//     '#ff9999', // Unhealthy
//     '#d79edb', // Very Unhealthy
//     '#e5b2b8'  // Hazardous
// ];

const getAQIColors = () => [
    '#2E7D32', // Dark green for Good
    '#F9A825', // Dark yellow for Moderate
    '#EF6C00', // Dark orange for Unhealthy for Sensitive Groups
    '#D32F2F', // Dark red for Unhealthy
    '#7B1FA2', // Dark purple for Very Unhealthy
    '#4E342E'  // Dark maroon for Hazardous
];



const AQI_THRESHOLDS = [50, 100, 150, 200, 300, 500];
const MAX_AQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];

const MobileAQISummary: React.FC<Props> = ({ data }) => {
    const { pm25, pm10, aqi_pm25, aqi_pm10, timestamp, overall_aqi } = data;
    const avgAQI = overall_aqi;
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
                hoverBackgroundColor: ['#e0e0e0', '#e0e0e0'], // Define a placeholder hover color
                cutout: '90%',
            },
        ],
    };
    

    const options: ChartOptions<'doughnut'> = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const label = tooltipItem.label || '';
                        const value = tooltipItem.raw as number;
                        return `${label}: ${value}`;
                    },
                },
            },
        },
    };

    return (
        <Card style={{ padding: '20px' }}>
            <Row gutter={[16, 16]} justify="center" align="middle">
                <Col xs={24} sm={24} md={8}>
                    <AQIDoughnutChart
                        avgAQI={avgAQI}
                        colors={colors}
                        dataConfig={dataConfig}
                        options={options}
                        AQI_THRESHOLDS={AQI_THRESHOLDS}
                        timestamp={dataConfig.timestamp}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        bordered={false}
                        style={{
                            textAlign: 'center',
                            backgroundColor: '#e6f7ff',
                            padding: '10px',
                            borderRadius: '8px'
                        }}
                    >
                        <Title level={5}>{pm25} µg/m³</Title>
                        <Title level={5}>AQI Based on pm2.5 - {aqi_pm25}</Title>
                        <Title level={4}>Realtime PM2.5 in ( # µg/m³ ) </Title>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Card
                        bordered={false}
                        style={{
                            textAlign: 'center',
                            backgroundColor: '#fffbe6',
                            padding: '10px',
                            borderRadius: '8px'
                        }}
                    >
                        <Title level={5}>{pm10} µg/m³</Title>
                        <Title level={5}>AQI Based on pm10 - {aqi_pm10}</Title>
                        <Title level={4}>Realtime PM10 in ( # µg/m³ )</Title>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default MobileAQISummary;
