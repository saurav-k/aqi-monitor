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

const getAQIColors = () => [
    '#a8e5a0', // Good
    '#ffffb3', // Moderate
    '#ffd699', // Unhealthy for Sensitive Groups
    '#ff9999', // Unhealthy
    '#d79edb', // Very Unhealthy
    '#e5b2b8'  // Hazardous
];

const AQI_THRESHOLDS = [50, 100, 150, 200, 300, 500];
const MAX_AQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];

const MobileAQISummary: React.FC<Props> = ({ data }) => {
    const { pm25, pm10, aqi_pm25, aqi_pm10 } = data;
    const avgAQI = (aqi_pm25 + aqi_pm10) / 2;
    const colors = getAQIColors();

    const dataConfig = {
        labels: ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous', 'Current AQI'],
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
                        <Title level={4}>PM2.5</Title>
                        <Text>{pm25} µg/m³</Text>
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
                        <Title level={4}>PM10</Title>
                        <Text>{pm10} µg/m³</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={8}>
                    <AQIDoughnutChart
                        avgAQI={avgAQI}
                        colors={colors}
                        dataConfig={dataConfig}
                        options={options}
                        AQI_THRESHOLDS={AQI_THRESHOLDS}
                    />
                </Col>
            </Row>
        </Card>
    );
};

export default MobileAQISummary;
