import React, { useState } from 'react';
import { useGetAQIDataQuery } from '../api/api';
import OverallAQIChart from './OverallAQIChart';
import PM25Chart from './PM25Chart';
import PM25ChartRaw from './PM25ChartRAW';
import PM10Chart from './PM10Chart';
import PM10ChartRaw from './PM10ChartRAW';
import SmoothAQI from './SMOOTHAQI';
import { AQIData } from '../types/aqiData';
import 'chart.js/auto';

// Space component for adding spacing between charts
const Space = ({ height = '20px' }) => <div style={{ height }} />;

// Options for time ranges in hours
const timeRangeOptions = [
    { label: '1 Hour', value: 1 },
    { label: '4 Hours', value: 4 },
    { label: '8 Hours', value: 8 },
    { label: '12 Hours', value: 12 },
    { label: '16 Hours', value: 16 },
    { label: '20 Hours', value: 20 },
    { label: '24 Hours', value: 24 },
    { label: '36 Hours', value: 36 },
    { label: '48 Hours', value: 48 },
];

// Helper function to convert JSON data to CSV format
const exportToCSV = (data: AQIData[], filename = 'chart_data.csv') => {
    const csvContent = [
        ['Timestamp', 'PM2.5 AQI', 'PM10 AQI', 'PM2.5 # µg/m³', 'PM10 # µg/m³', 'Average  AQI'],
        ...data.map((item) => [
            item.timestamp,
            item.aqi_pm25,
            item.aqi_pm10,
            item.pm25,
            item.pm10,
            (item.aqi_pm25 + item.aqi_pm10) / 2
        ])
    ]
        .map((e) => e.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(2880);
    const [timeRange, setTimeRange] = useState(24);

    const { data = [], error, isLoading } = useGetAQIDataQuery({
        limit: dataPoints,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;
    const filteredData = data
        .slice()
        .reverse()
        .filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ width: '20%', padding: '10px' }}>
                <h3>Settings</h3>
                <label htmlFor="dataPoints">Select Data Points: </label>
                <select
                    id="dataPoints"
                    value={dataPoints}
                    onChange={(e) => setDataPoints(Number(e.target.value))}
                    style={{ display: 'block', marginBottom: '10px' }}
                >
                    <option value={100}>100</option>
                    <option value={200}>200</option>
                    <option value={500}>500</option>
                    <option value={1000}>1000</option>
                    <option value={2000}>2000</option>
                    <option value={2880}>2880</option>
                    <option value={5760}>5760</option>
                    <option value={10000}>10000</option>
                </select>

                <label htmlFor="timeRange">Select Time Range: </label>
                <select
                    id="timeRange"
                    value={timeRange}
                    onChange={(e) => setTimeRange(Number(e.target.value))}
                    style={{ display: 'block', marginBottom: '10px' }}
                >
                    {timeRangeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Export button to download data as CSV */}
                <button
                    style={{
                        marginTop: '20px',
                        padding: '10px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                    onClick={() => exportToCSV(filteredData)}
                >
                    Export Data as CSV
                </button>
            </div>

            <div style={{ width: '80%', padding: '20px', margin: '20px', overflow: 'auto' }}>
                <h2>AQI Data Over Time</h2>

                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <SmoothAQI data={filteredData} />
                </div>
                <Space height="400px" />
                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <OverallAQIChart data={filteredData} />
                </div>
                <Space height="400px" />
                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <PM25Chart data={filteredData} />
                </div>
                <Space height="400px" />
                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <PM10Chart data={filteredData} />
                </div>
                <Space height="400px" />
                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <PM25ChartRaw data={filteredData} />
                </div>
                <Space height="400px" />
                <div style={{ width: '90%', height: '400px', margin: '20px' }}>
                    <PM10ChartRaw data={filteredData} />
                </div>
            </div>
        </div>
    );
};

export default AQIChart;
