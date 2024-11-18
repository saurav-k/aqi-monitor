import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Button } from 'antd';
import { AQIData } from '../types/aqiData';
import { formatTimestamp } from '../utils/dateUtils';
import './MobileHourly.css';
import { ChartJSOrUndefined } from 'react-chartjs-2/dist/types';

ChartJS.register(...registerables, zoomPlugin);

interface Props {
    data: AQIData[];
}

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

const getHalfHourlyAverageData = (data: AQIData[]) => {
    const halfHourlyData: { [halfHour: string]: { totalAQI: number, count: number } } = {};

    data.forEach((item) => {
        const timestamp = new Date(item.timestamp);
        const hour = timestamp.getHours();
        const minutes = timestamp.getMinutes();
        const halfHourSegment = minutes < 30 ? "00" : "30";
        const date = timestamp.toDateString();
        const key = `${date} ${hour}:${halfHourSegment}`;
        const avgAQI = Math.max(item.aqi_pm25, item.aqi_pm10);
        if (!halfHourlyData[key]) {
            halfHourlyData[key] = { totalAQI: 0, count: 0 };
        }

        halfHourlyData[key].totalAQI += avgAQI;
        halfHourlyData[key].count += 1;
    });

    return Object.keys(halfHourlyData).map((key) => ({
        time: key,
        aqi: halfHourlyData[key].totalAQI / halfHourlyData[key].count,
    }));
};


const getLastFiveEntries = (data: AQIData[]) => {
    return data.slice(-5).map((item) => ({
        time: item.timestamp,
        aqi: (item.aqi_pm25 + item.aqi_pm10) / 2,
    }));
};

const MobileHourlyMaxAQIChart: React.FC<Props> = ({ data }) => {
    const chartRef = React.useRef<ChartJSOrUndefined<'line'>>(null);

    // Get both hourly max data and latest five entries
    const historicalData = getHalfHourlyAverageData(data);
    const latestData = getLastFiveEntries(data);

    // Merge the time labels and AQI values
    const combinedLabels = [
        ...historicalData.map((item) => formatTimestamp(item.time)),
        ...latestData.map((item) => formatTimestamp(item.time)),
    ];
    const combinedData = [
        ...historicalData.map((item) => item.aqi),
        ...latestData.map((item) => item.aqi),
    ];

    const chartData = {
        labels: combinedLabels,
        datasets: [
            {
                label: 'Half Hourly Average AQI Data',
                data: combinedData,
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            zoom: {
                pan: {
                    enabled: false,
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'x' as const,
                },
            },
        },
        interaction: {
            mode: 'index' as 'index',
            intersect: false,
        },
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
                    text: 'Time',
                },
            },
        },
    };

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
            <h3>Half Hourly Average AQI Data</h3>
            <div style={{ position: 'relative', height: '400px' }}>
                <Line ref={chartRef} data={chartData} options={options} />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <Button onClick={handleZoomIn}>+</Button>
                <Button onClick={handleZoomOut}>-</Button>
                <Button onClick={handleResetZoom}>Reset</Button>
            </div>
        </div>
    );
};

export default MobileHourlyMaxAQIChart;
