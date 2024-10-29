import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import { Chart as ChartJS, ChartOptions, Plugin } from 'chart.js';

import '../chartConfig';
import { formatTimestamp } from '../utils/dateUtils';

interface Props {
    data: AQIData[];
}

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
        const { ctx, chartArea } = chart;
        if (!chartArea) return;

        const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        
        gradient.addColorStop(0, '#a8e5a0');
        gradient.addColorStop(0.17, '#ffffb3');
        gradient.addColorStop(0.33, '#ffd699');
        gradient.addColorStop(0.5, '#ff9999');
        gradient.addColorStop(0.67, '#d79edb');
        gradient.addColorStop(0.83, '#e5b2b8');

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
        maintainAspectRatio: false,  // Enable flexible aspect ratio for mobile
        plugins: {
            legend: {
                labels: {
                    font: {
                        size: window.innerWidth < 600 ? 10 : 14, // Adjust font size for smaller screens
                    }
                }
            },
            tooltip: {
                bodyFont: {
                    size: window.innerWidth < 600 ? 10 : 12, // Adjust tooltip font size
                }
            },
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
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: window.innerWidth < 600 ? 4 : 10, // Limit ticks for smaller screens
                }
            },
            y: {
                beginAtZero: true,
                ticks: {
                    callback: (tickValue: string | number) => `${tickValue} AQI`,
                    font: {
                        size: window.innerWidth < 600 ? 10 : 12 // Adjust y-axis tick font size
                    }
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: window.innerWidth < 600 ? '300px' : '500px' }}>
            <h3 style={{ fontSize: window.innerWidth < 600 ? '16px' : '20px', textAlign: 'center' }}>
                AQI with Moving Averages (SMA 20)
            </h3>
            <Line data={chartData} options={options} plugins={[aqiGradientBackground]} />
        </div>
    );
};

export default SmoothAQI;
