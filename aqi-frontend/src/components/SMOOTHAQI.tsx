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

const aqiGradientBackground: Plugin = {
    id: 'aqiGradientBackground',
    beforeDraw: (chart: ChartJS) => {
        const { ctx, chartArea, data } = chart;
        if (!chartArea) return;

        // Calculate max AQI from data, filtering out non-numeric values
        const maxAQI = Math.max(
            ...data.datasets[0].data
                .filter((val): val is number => typeof val === 'number' && val !== null)
        );

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);

        // Define AQI thresholds and corresponding colors
        const thresholds = [0, 50, 100, 150, 200, 300, 500];
        const colors = ['#a8e5a0', '#ffffb3', '#ffd699', '#ff9999', '#d79edb', '#e5b2b8'];

        // Determine the proportion of each threshold to the maxAQI
        thresholds.forEach((threshold, index) => {
            if (threshold <= maxAQI) {
                const position = threshold / maxAQI;
                gradient.addColorStop(position, colors[index]);
            } else if (index > 0 && thresholds[index - 1] <= maxAQI) {
                // Extend the last applicable color to the end of the gradient
                gradient.addColorStop(1, colors[index - 1]);
            }
        });

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
        ctx.restore();
    }
};



const SmoothAQI: React.FC<Props> = ({ data }) => {
    const aqiValues = data.map((item) => item.overall_aqi );
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