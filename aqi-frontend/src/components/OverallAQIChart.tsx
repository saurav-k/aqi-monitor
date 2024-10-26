import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

interface Props {
    data: AQIData[];
}

const OverallAQIChart: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Overall AQI',
                data: data.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2),
                fill: false,
                borderColor: 'rgba(255,99,132,1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div>
            <h3>Overall AQI</h3>
            <Line data={chartData} />
        </div>
    );
};

export default OverallAQIChart;
