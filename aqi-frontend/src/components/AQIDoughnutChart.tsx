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
        labels: ['AQI Levels', 'Needle'],
        datasets: [
            {
                data: AQI_THRESHOLDS,
                backgroundColor: colors,
                borderWidth: 0,
                hoverBackgroundColor: colors,
                cutout: '60%', // Adjust to make the arc "fat"
            },
            // Gauge data segment for needle representation
            {
                data: [0.1, maxAQI - 0.1], // Make needle larger by increasing its percentage
                backgroundColor: ['#050505', 'rgba(0, 0, 0, 0)'], // Red color for the needle
                borderWidth: 0,
                cutout: '75%', // Match the cutout size for needle thickness
                rotation: (avgAQI / maxAQI) * 180 - 90, // Position needle at correct angle
                circumference: 180, // Half-circle
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

    return (
        <div style={{ textAlign: 'center' }}>
            <Title level={4}>Near Realtime AQI</Title>
            <Text style={{
                fontSize: '24px',
                color: colors[gaugeIndex],
                fontWeight: 'bold',
                display: 'block',
            }}>
                {avgAQI.toFixed(0)}
            </Text>
            <div style={{ width: '300px', height: '150px', margin: '0 auto' }}>
                <Doughnut data={dataConfig} options={options} />
            </div>
        </div>
    );
};

export default AQIDoughnutChart;
