// MobileAQIChart.tsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import { formatTimestamp } from '../utils/dateUtils';

interface Props {
    data: AQIData[];
}

const MobileAQIChart: React.FC<Props> = ({ data }) => {
    // Reverse the data array to show the latest data on the right
    const reversedData = [...data].reverse();

    const aqiValues = reversedData.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2);

    const chartData = {
        labels: reversedData.map((item) => formatTimestamp(item.timestamp)),
        datasets: [
            {
                label: 'Overall AQI',
                data: aqiValues,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
                borderWidth: 2,
                pointRadius: 0, // hide points for a cleaner look on mobile
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                display: false, // Hide x-axis for simplicity
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number) => `${tickValue} AQI`,
                }
            },
        },
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Mobile AQI Trend</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default MobileAQIChart;
