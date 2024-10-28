import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import { Chart as ChartJS, ChartOptions, Plugin } from 'chart.js';

import '../chartConfig';
import { formatTimestamp } from '../utils/dateUtils';

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

// Custom plugin to draw AQI gradient background
const aqiGradientBackground: Plugin = {
    id: 'aqiGradientBackground',
    beforeDraw: (chart: ChartJS) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        
        // Define reversed and lighter AQI color thresholds
        gradient.addColorStop(0, '#a8e5a0'); // Good (light green)
        gradient.addColorStop(0.17, '#ffffb3'); // Moderate (light yellow)
        gradient.addColorStop(0.33, '#ffd699'); // Unhealthy for Sensitive Groups (light orange)
        gradient.addColorStop(0.5, '#ff9999'); // Unhealthy (light red)
        gradient.addColorStop(0.67, '#d79edb'); // Very Unhealthy (light purple)
        gradient.addColorStop(0.83, '#e5b2b8'); // Hazardous (light maroon)

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
    }
};

const SmoothAQI: React.FC<Props> = ({ data }) => {
    const aqiValues = data.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2);
    const smoothedData = movingAverage(aqiValues, 20);

    const chartData = {
        labels: data.map((item) => formatTimestamp(item.timestamp)),
        datasets: [
            {
                label: 'Smoothed Overall AQI (Window 20)',
                data: smoothedData,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
                borderWidth: 1
            }
        ]
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            zoom: {
                pan: { enabled: true, mode: 'x' },
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x',
                },
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number) => `${tickValue} AQI`
                }
            }
        }
    };

    return (
        <div>
            <h3>AQI with Moving Averages (SMA 20)</h3>
            <Line data={chartData} options={options} plugins={[aqiGradientBackground]} />
        </div>
    );
};

export default SmoothAQI;
