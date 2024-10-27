import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

import '../chartConfig'; 

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
    
    // Calculate SMAs
    const smoothedData = movingAverage(aqiValues, 5);
    const sma50 = movingAverage(aqiValues, 50);
    const sma100 = movingAverage(aqiValues, 100);
    const sma200 = movingAverage(aqiValues, 200);

    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Smoothed Overall AQI (Window 5)',
                data: smoothedData,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
                borderWidth: 1
            },
            // {
            //     label: 'SMA 50',
            //     data: sma50,
            //     fill: false,
            //     borderColor: 'rgba(153,102,255,1)',
            //     tension: 0.1,
            //     borderWidth: 1
            // },
            // {
            //     label: 'SMA 100',
            //     data: sma100,
            //     fill: false,
            //     borderColor: 'rgba(255,159,64,1)',
            //     tension: 0.1,
            //     borderWidth: 1
            // },
            // {
            //     label: 'SMA 200',
            //     data: sma200,
            //     fill: false,
            //     borderColor: 'rgba(54,162,235,1)',
            //     tension: 0.1,
            //     borderWidth: 1
            // }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x' as const,  // specify mode as literal type
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x' as const,  // specify mode as literal type
                }
            }
        }
    };
    

    return (
        <div>
            <h3>AQI with Moving Averages (SMA 50, 100, 200)</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default SmoothAQI;
