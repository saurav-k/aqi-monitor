import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

interface Props {
    data: AQIData[];
}

const PM25Chart: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM2.5',
                data: data.map((item) => item.aqi_pm25),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div>
            <h3>PM2.5 Levels</h3>
            <Line data={chartData} />
        </div>
    );
};

export default PM25Chart;
