import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Button } from 'antd';
import { ZPHS01BData } from '../../types/aqiData';
import './MobileVOCChart.css';

ChartJS.register(...registerables, zoomPlugin);

interface VOCChartProps {
    data: ZPHS01BData[];
}

// Helper function to format the timestamp for the X-axis
const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Sliding window average for smoothing
const getSlidingWindowAverage = (data: number[], windowSize: number): number[] => {
    return data.map((_, index, array) => {
        const window = array.slice(Math.max(0, index - windowSize + 1), index + 1);
        const windowSum = window.reduce((acc, value) => acc + value, 0);
        return windowSum / window.length;
    });
};

const MobileVOCChart: React.FC<VOCChartProps> = ({ data }) => {
    const chartRef = React.useRef<any>(null);

    // Prepare the VOC data
    const timestamps = data.map(item => formatTimestamp(item.timestamp));
    const vocValues = data.map(item => item.voc || 0);
    const smoothedVOCValues = getSlidingWindowAverage(vocValues, 5);

    // Chart data
    const chartData = {
        labels: timestamps,
        datasets: [
            {
                label: 'Smoothed VOC Levels',
                data: smoothedVOCValues,
                borderColor: 'rgba(75,192,192,1)',
                borderWidth: 2,
                tension: 0.2,
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
                    mode: 'x' as const, // Correct TypeScript type
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x' as const, // Correct TypeScript type
                },
            },
        },
        interaction: {
            mode: 'index' as const, // Correct TypeScript type
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'VOC Level',
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

        // Zoom handlers
    const handleZoomIn = () => {
        if (chartRef.current) {
            chartRef.current.zoom(1.2);
        }
    };

    const handleZoomOut = () => {
        if (chartRef.current) {
            chartRef.current.zoom(0.8);
        }
    };

    const handleResetZoom = () => {
        if (chartRef.current) {
            chartRef.current.resetZoom();
        }
    };
    

    return (
        <div style={{ padding: '20px', maxWidth: '100%' }}>
            <h3>VOC Levels (Smoothed)</h3>
            <p>This chart shows smoothed VOC levels over time, using a sliding window average to smooth fluctuations.</p>
            <div style={{ position: 'relative', height: '400px' }}>
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Button onClick={handleZoomIn}>Zoom In</Button>
                <Button onClick={handleZoomOut}>Zoom Out</Button>
                <Button onClick={handleResetZoom}>Reset Zoom</Button>
            </div>
        </div>
    );
};

export default MobileVOCChart;
