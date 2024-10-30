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

const AQIDoughnutChart: React.FC<AQIDoughnutChartProps> = ({ avgAQI, colors, dataConfig, options, AQI_THRESHOLDS }) => (
    <div style={{ textAlign: 'center' }}>
        <Title level={4}>Near Realtime AQI</Title>
        <Text style={{
            fontSize: '24px',
            color: colors[AQI_THRESHOLDS.findIndex((threshold) => avgAQI <= threshold)],
            fontWeight: 'bold',
            display: 'block',
        }}>
            {avgAQI.toFixed(0)}
        </Text>
        <div style={{ width: '150px', height: '150px', margin: '0 auto' }}>
            <Doughnut data={dataConfig} options={options} />
        </div>
    </div>
);

export default AQIDoughnutChart;
