import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

interface Props {
    data: AQIData[];
}

// Moving average function to smooth data
const movingAverage = (data: number[], windowSize: number): number[] => {
    return data.map((val, idx, arr) => {
        const start = Math.max(0, idx - windowSize + 1);
        const subset = arr.slice(start, idx + 1);
        const sum = subset.reduce((acc, curr) => acc + curr, 0);
        return sum / subset.length;
    });
};

const SmoothAQI: React.FC<Props> = ({ data }) => {
    // Calculate AQI values
    const aqiValues = data.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2);
    
    // Apply moving average for smoothing (you can adjust windowSize for more/less smoothing)
    const smoothedData = movingAverage(aqiValues, 5);

    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Smoothed Overall AQI',
                data: smoothedData,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    return (
        <div>
            <h3>Smoothed Overall AQI</h3>
            <Line data={chartData} />
        </div>
    );
};

export default SmoothAQI;
