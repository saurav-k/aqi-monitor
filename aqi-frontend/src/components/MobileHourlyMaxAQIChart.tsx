import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import { formatTimestamp } from '../utils/dateUtils';

interface Props {
    data: AQIData[];
}

// Helper function to group data by hour and take the maximum AQI for each hour
const getHourlyMaxData = (data: AQIData[]) => {
    const hourlyMaxData: { [hour: string]: number } = {};

    data.forEach((item) => {
        const hour = new Date(item.timestamp).getHours();
        const date = new Date(item.timestamp).toDateString();
        const key = `${date} ${hour}:00`;

        const avgAQI = (item.aqi_pm25 + item.aqi_pm10) / 2;
        if (!hourlyMaxData[key] || avgAQI > hourlyMaxData[key]) {
            hourlyMaxData[key] = avgAQI;
        }
    });

    return Object.keys(hourlyMaxData).map((key) => ({
        time: key,
        aqi: hourlyMaxData[key],
    }));
};

// Append the last few data points to the generated hourly data
const appendRecentDataPoints = (hourlyData: { time: string; aqi: number }[], data: AQIData[], numPoints: number) => {
    const recentData = data.slice(-numPoints).map((item) => ({
        time: formatTimestamp(item.timestamp),
        aqi: (item.aqi_pm25 + item.aqi_pm10) / 2,
    }));
    return [...hourlyData, ...recentData];
};

const MobileHourlyMaxAQIChart: React.FC<Props> = ({ data }) => {
    const hourlyMaxData = getHourlyMaxData(data);
    const chartDataWithRecentPoints = appendRecentDataPoints(hourlyMaxData, data, 5); // Append last 5 data points


    const chartData = {
        labels: hourlyMaxData.map((item) => formatTimestamp(item.time)),
        datasets: [
            {
                label: 'Hourly Max AQI',
                data: hourlyMaxData.map((item) => item.aqi),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
                borderWidth: 1,
            }
        ]
    };

    const options = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number) => `${tickValue} AQI`,
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Hour',
                },
            },
        },
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3>Hourly Max AQI</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default MobileHourlyMaxAQIChart;
