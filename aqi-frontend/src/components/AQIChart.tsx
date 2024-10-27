import React, { useState } from 'react';
import { useGetAQIDataQuery } from '../api/api';
import OverallAQIChart from './OverallAQIChart';
import PM25Chart from './PM25Chart';
import PM10Chart from './PM10Chart';
import SmoothAQI from './SMOOTHAQI';
import 'chart.js/auto';

// Space component for adding spacing between charts
const Space = ({ height = '20px' }) => <div style={{ height }} />;

// Options for time ranges in hours
const timeRangeOptions = [
    { label: '1 Hour', value: 1 },
    { label: '4 Hours', value: 4 },
    { label: '8 Hours', value: 8 },
    { label: '12 Hours', value: 12 },
    { label: '24 Hours', value: 24 },
    { label: '48 Hours', value: 48 },
];

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(100); // Default data points
    const [timeRange, setTimeRange] = useState(24); // Default time range in hours

    // Use the useGetAQIDataQuery hook with parameters as an object
    const { data = [], error, isLoading } = useGetAQIDataQuery({
        limit: dataPoints,
    });

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    // Calculate the timestamp cutoff based on the selected time range
    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - timeRange * 60 * 60 * 1000; // Convert hours to milliseconds

    // Filter data to include only entries within the selected time range
    const filteredData = data
        .slice()
        .reverse() // Reverse for chronological order
        .filter((item) => new Date(item.timestamp).getTime() >= cutoffTime);

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            {/* Sidebar for options */}
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
            </div>

            {/* Main content area for charts */}
            <div style={{ width: '80%', padding: '10px' }}>
                <h2>AQI Data Over Time</h2>

                {/* Chart containers with marginBottom */}
                <div style={{ width: '80%', height: '400px', marginBottom: '20px' }}>
                    <SmoothAQI data={filteredData} />
                </div>
                <Space height="200px" />

                <div style={{ width: '80%', height: '400px', marginBottom: '20px' }}>
                    <OverallAQIChart data={filteredData} />
                </div>
                <Space height="200px" />

                <div style={{ width: '80%', height: '400px', marginBottom: '20px' }}>
                    <PM25Chart data={filteredData} />
                </div>
                <Space height="200px" />

                <div style={{ width: '80%', height: '400px', marginBottom: '20px' }}>
                    <PM10Chart data={filteredData} />
                </div>
            </div>
        </div>
    );
};

export default AQIChart;
