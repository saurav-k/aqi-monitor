import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables, Plugin } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { ZPHS01BData } from '../../types/aqiData';
import './MobileVOCChart.css';

ChartJS.register(...registerables, zoomPlugin);

interface VOCChartProps {
    data: ZPHS01BData[];
}

// Helper function to format the timestamp for the X-axis
const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}:${month}:${year} ${hours}:${minutes}`;
};

// Function to determine the color of the dot based on VOC value
const getDotColor = (voc: number) => {
    if (voc > 2) return '#ff9999'; // Light red for hazardous level
    if (voc === 2) return '#ffcc99'; // Light orange for moderate level
    if (voc === 1) return '#ffff99'; // Light yellow for mild level
    return '#ccffcc'; // Light green for safe level
};

const MobileVOCChart: React.FC<VOCChartProps> = ({ data }) => {
    // Prepare the data for Chart.js
    const twelveHoursAgo = new Date().getTime() - 12 * 60 * 60 * 1000;
    const filteredData = data.filter((item) => new Date(item.timestamp).getTime() >= twelveHoursAgo);

    const timestamps = filteredData.map((item) => formatTimestamp(item.timestamp));
    const vocValues = filteredData.map((item) => item.voc || 0);
    const dotColors = filteredData.map((item) => getDotColor(item.voc || 0));

    // Chart.js data
    const chartData = {
        labels: timestamps,
        datasets: [
            {
                label: 'VOC Levels',
                data: vocValues,
                // borderColor: 'rgba(75,192,192,1)',
                borderColor: 'white',
                borderWidth: 0.5,
                tension: 0.1,
                pointBackgroundColor: dotColors,
                pointBorderColor: 'transparent',
                pointRadius: 5, // Adjust the dot size
                fill: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x' as const,
                },
                zoom: {
                    wheel: {
                        enabled: true, // Enable zooming with the mouse wheel
                    },
                    pinch: {
                        enabled: true, // Enable zooming with pinch gestures
                    },
                    mode: 'x' as const,
                },
            },
        },
        interaction: {
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: false,
                min: -1, // Start y-axis from -1
                max: 4,
                title: {
                    display: true,
                    text: 'VOC Level',
                },
                ticks: {
                    stepSize: 0.5,
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Time',
                },
            },
        },
    };
    

    return (
        <div className="MobileVOCChart-container">
            <h2>VOC Levels Over Time</h2>
            <div className="MobileVOCChart-chart">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

export default MobileVOCChart;
