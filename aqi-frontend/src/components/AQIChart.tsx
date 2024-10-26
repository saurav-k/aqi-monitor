import React from 'react';
import { Line } from 'react-chartjs-2';
import { useGetAQIDataQuery } from '../api/api';
import 'chart.js/auto';

const AQIChart: React.FC = () => {
    const { data = [], error, isLoading } = useGetAQIDataQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM2.5',
                data: data.map((item) => item.pm25),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            },
            {
                label: 'PM10',
                data: data.map((item) => item.pm10),
                fill: false,
                borderColor: 'rgba(153,102,255,1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div>
            <h2>AQI Data Over Time</h2>
            <Line data={chartData} />
        </div>
    );
};

export default AQIChart;
