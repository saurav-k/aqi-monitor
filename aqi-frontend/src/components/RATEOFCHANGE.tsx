import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';

import '../chartConfig';

interface Props {
    data: AQIData[];
}

// Moving average function to smooth data
// const movingAverage = (data: number[], windowSize: number): number[] => {
//     return data.map((val, idx, arr) => {
//         const start = Math.max(0, idx - windowSize + 1);
//         const subset = arr.slice(start, idx + 1);
//         const sum = subset.reduce((acc, curr) => acc + curr, 0);
//         return sum / subset.length;
//     });
// };

// Function to calculate rate of change over last 5 readings
const rateOfChange = (data: number[], windowSize: number): number[] => {
    return data.map((val, idx, arr) => {
        if (idx < windowSize) return 0; // No rate of change for initial values
        const previous = arr[idx - windowSize];
        return ((val - previous) / previous) * 100;
    });
};

const RateOfChange: React.FC<Props> = ({ data }) => {
    // Calculate AQI values
    const aqiValues = data.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2);
    
    // Calculate SMAs
    // const smoothedData = movingAverage(aqiValues, 20);
    const rateOfChangeData = rateOfChange(aqiValues, 5);  // Calculate rate of change for last 5 readings

    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toISOString().replace('T', ' ').slice(0, 19)),
        datasets: [
            // {
            //     label: 'Smoothed Overall AQI (Window 20)',
            //     data: smoothedData,
            //     fill: false,
            //     borderColor: 'rgba(75,192,192,1)',
            //     tension: 0.1,
            //     borderWidth: 1
            // },
            {
                label: 'Rate of Change (Last 5 readings)',
                data: rateOfChangeData,
                fill: false,
                borderColor: 'rgba(255,99,132,1)',
                tension: 0.1,
                borderWidth: 1
            }
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
        },
        scales: {
            y: {
                title: {
                    display: true,
                    text: 'AQI & Rate of Change (%)'
                }
            }
        }
    };

    return (
        <div>
            <h3>AQI with Moving Averages & Rate of Change (Last 5 readings)</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default RateOfChange;
