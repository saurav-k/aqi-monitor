// AQIDoughnutChart.tsx
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Typography } from 'antd';
import { ChartOptions } from 'chart.js';

const { Title, Text } = Typography;

interface AQIDoughnutChartProps {
    avgAQI: number;
    colors: string[];
    dataConfig: {
        labels: string[];
        datasets: Array<{
            data: number[];
            backgroundColor: string[];
            borderWidth: number;
            hoverBackgroundColor: string[];
            cutout: string;
        }>;
    };
    options: ChartOptions<'doughnut'>;
    AQI_THRESHOLDS: number[];
}

const AQIDoughnutChart: React.FC<AQIDoughnutChartProps> = ({ avgAQI, colors, AQI_THRESHOLDS }) => {
    const maxAQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
    const gaugeIndex = AQI_THRESHOLDS.findIndex(threshold => avgAQI <= threshold);

    const dataConfig = {
        labels: ['AQI Levels'],
        datasets: [
            {
                data: AQI_THRESHOLDS,
                backgroundColor: colors,
                borderWidth: 0,
                hoverBackgroundColor: colors,
                cutout: '70%', // Adjust cutout for a thick gauge arc
            },
        ],
    };

    const options: ChartOptions<'doughnut'> = {
        rotation: -90, // Start angle for the semi-circle
        circumference: 180, // Half-circle
        responsive: true,
        maintainAspectRatio: false,
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

    // Calculate the needle angle based on the AQI value
    const needleAngle = (avgAQI / maxAQI) * 180;

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            <Title level={4}>Near Realtime AQI</Title>
            <Text style={{
                fontSize: '24px',
                color: colors[gaugeIndex],
                fontWeight: 'bold',
                display: 'block',
            }}>
                {avgAQI.toFixed(0)}
            </Text>
            <div style={{ width: '300px', height: '150px', margin: '0 auto', position: 'relative' }}>
                <Doughnut data={dataConfig} options={options} />
                
                {/* Needle overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '2px', // Needle thickness
                        height: '75px', // Needle length
                        backgroundColor: '#050505', // Needle color
                        transformOrigin: 'bottom center',
                        transform: `rotate(${needleAngle - 90}deg) translateY(-50%)`,
                        zIndex: 10,
                    }}
                />
                
                {/* Needle base (optional) */}
                {/* <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#050505',
                        borderRadius: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 10,
                    }}
                /> */}
            </div>
        </div>
    );
};

export default AQIDoughnutChart;
