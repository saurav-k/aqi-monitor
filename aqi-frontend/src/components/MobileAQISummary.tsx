import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import { Pie, Chart as ChartJS } from 'react-chartjs-2';
import { Chart, ChartOptions } from 'chart.js'; // Import Chart from chart.js
import { AQIData } from '../types/aqiData';

const { Title, Text } = Typography;

interface Props {
    data: AQIData;
}

// Define color thresholds for AQI levels
const getAQIColors = () => [
    '#a8e5a0', // Good (light green)
    '#ffffb3', // Moderate (light yellow)
    '#ffd699', // Unhealthy for Sensitive Groups (light orange)
    '#ff9999', // Unhealthy (light red)
    '#d79edb', // Very Unhealthy (light purple)
    '#e5b2b8'  // Hazardous (light maroon)
];

// AQI thresholds
const AQI_THRESHOLDS = [50, 100, 150, 200, 300, 500];
const MAX_AQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];

// Custom plugin to draw an arrow pointing to the current AQI level
// const arrowPlugin = {
//     id: 'arrowPlugin',
//     beforeDraw: (chart: typeof ChartJS.prototype) => {  // Use typeof ChartJS.prototype for type
//         const { ctx, chartArea, data } = chart;
//         if (!chartArea) return; // Ensure chart area is available
//         const { width, height } = chartArea;
//         const aqi = data.datasets[0].data[0] as number;

//         // Calculate the angle for the arrow
//         const angle = (aqi / MAX_AQI) * 2 * Math.PI - Math.PI / 2;
//         const centerX = width / 2;
//         const centerY = height / 2;
//         const arrowLength = Math.min(width, height) / 3;

//         ctx.save();
//         ctx.beginPath();
//         ctx.translate(centerX, centerY);
//         ctx.rotate(angle);
//         ctx.moveTo(0, 0);
//         ctx.lineTo(arrowLength, 0);
//         ctx.lineTo(arrowLength - 10, -5); // Arrowhead
//         ctx.moveTo(arrowLength, 0);
//         ctx.lineTo(arrowLength - 10, 5);
//         ctx.strokeStyle = '#333';
//         ctx.lineWidth = 2;
//         ctx.stroke();
//         ctx.restore();
//     }
// };

// Register the custom plugin globally using Chart from chart.js
// Chart.register(arrowPlugin);

const MobileAQISummary: React.FC<Props> = ({ data }) => {
    const { pm25, pm10, aqi_pm25, aqi_pm10 } = data;

    const avgAQI = (aqi_pm25 + aqi_pm10) / 2;
    const colors = getAQIColors();

    // Calculate data for each AQI segment
    const pieData = {
        labels: ['Good', 'Moderate', 'Unhealthy for Sensitive', 'Unhealthy', 'Very Unhealthy', 'Hazardous'],
        datasets: [
            {
                data: AQI_THRESHOLDS.map((threshold) => (avgAQI > threshold ? threshold : avgAQI)), // Highlight up to current AQI level
                backgroundColor: colors,
                borderWidth: 1,
                borderColor: '#ffffff',
            }
        ]
    };

    const pieOptions: ChartOptions<'pie'> = { // Type as ChartOptions
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true }
        },
        cutout: '70%', // Creates the donut effect
    };

    return (
        <Card style={{ padding: '20px' }}>
            <Row gutter={[16, 16]} justify="center">
                <Col span={12}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            textAlign: 'center', 
                            backgroundColor: '#e6f7ff', // Light blue background for PM2.5
                            padding: '10px',
                            borderRadius: '8px'
                        }}
                    >
                        <Title level={4}>PM2.5</Title>
                        <Text>{pm25} µg/m³</Text>
                    </Card>
                </Col>
                <Col span={12}>
                    <Card 
                        bordered={false} 
                        style={{ 
                            textAlign: 'center', 
                            backgroundColor: '#fffbe6', // Light yellow background for PM10
                            padding: '10px',
                            borderRadius: '8px'
                        }}
                    >
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
                    <Text style={{ fontSize: '24px', color: getAQIColors()[AQI_THRESHOLDS.findIndex((threshold) => avgAQI <= threshold)], fontWeight: 'bold', display: 'block', textAlign: 'center' }}>
                        {avgAQI.toFixed(0)}
                    </Text>
                </Col>
            </Row>
        </Card>
    );
};

export default MobileAQISummary;
