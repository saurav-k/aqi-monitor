import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

interface Props {
    data: AQIData[];
}

const PM10Chart: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM10',
                data: data.map((item) => item.aqi_pm10),
                fill: false,
                borderColor: 'rgba(153,102,255,1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div>
            <h3>PM10 Levels</h3>
            <Line data={chartData} />
        </div>
    );
};

export default PM10Chart;
