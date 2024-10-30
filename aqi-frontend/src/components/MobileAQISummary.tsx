import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Pie } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

const { Title, Text } = Typography;

interface Props {
    data: AQIData;
}

// Function to get color based on AQI level
const getAQIColor = (aqiValue: number) => {
    if (aqiValue <= 50) return '#a8e5a0'; // Good
    if (aqiValue <= 100) return '#ffffb3'; // Moderate
    if (aqiValue <= 150) return '#ffd699'; // Unhealthy for Sensitive Groups
    if (aqiValue <= 200) return '#ff9999'; // Unhealthy
    if (aqiValue <= 300) return '#d79edb'; // Very Unhealthy
    return '#e5b2b8'; // Hazardous
};

const MobileAQISummary: React.FC<Props> = ({ data }) => {
    const { pm25, pm10, aqi_pm25, aqi_pm10 } = data;

    const avgAQI = (aqi_pm25 + aqi_pm10) / 2;
    const pieColor = getAQIColor(avgAQI);

    const pieData = {
        labels: ['AQI Level'],
        datasets: [
            {
                data: [avgAQI, 300 - avgAQI],
                backgroundColor: [pieColor, '#f0f0f0'],
                borderWidth: 0,
            }
        ]
    };

    const pieOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
        },
        cutout: '70%', // Creates the donut effect
    };

    return (
        <Card style={{ padding: '20px' }}>
            <Row gutter={[16, 16]} justify="center">
                <Col span={12}>
                    <Card bordered={false} style={{ textAlign: 'center' }}>
                        <Title level={4}>PM2.5</Title>
                        <Text>{pm25} µg/m³</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card bordered={false} style={{ textAlign: 'center' }}>
                        <Title level={4}>PM10</Title>
                        <Text>{pm10} µg/m³</Text>
                    </Card>
                </Col>
            </Row>
            <Row justify="center" style={{ marginTop: '20px' }}>
                <Col>
                    <Title level={4} style={{ textAlign: 'center' }}>Overall AQI</Title>
                    <div style={{ width: '150px', height: '150px', margin: '0 auto' }}>
                        <Pie data={pieData} options={pieOptions} />
                    </div>
                    <Text style={{ fontSize: '24px', color: pieColor, fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
                        {avgAQI.toFixed(0)}
                    </Text>
                </Col>
            </Row>
        </Card>
    );
};

export default MobileAQISummary;
