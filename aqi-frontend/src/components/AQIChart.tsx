import React, { useState } from 'react';
import { useGetAQIDataQuery } from '../api/api';
import OverallAQIChart from './OverallAQIChart';
import PM25Chart from './PM25Chart';
import PM10Chart from './PM10Chart';
import 'chart.js/auto';

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
        <div>
            <h2>AQI Data Over Time</h2>

            {/* Dropdown for selecting the time range */}
            {/* <label htmlFor="timeRange">Select Time Range: </label>
            <select
                id="timeRange"
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
            >
                {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select> */}

            {/* Dropdown for selecting the number of data points */}
            <label htmlFor="dataPoints">Select Data Points: </label>
            <select
                id="dataPoints"
                value={dataPoints}
                onChange={(e) => setDataPoints(Number(e.target.value))}
            >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={500}>500</option>
                <option value={1000}>1000</option>
            </select>

            {/* Render each chart with filtered data */}
            <OverallAQIChart data={filteredData} />
            <PM25Chart data={filteredData} />
            <PM10Chart data={filteredData} />
        </div>
    );
};

export default AQIChart;
