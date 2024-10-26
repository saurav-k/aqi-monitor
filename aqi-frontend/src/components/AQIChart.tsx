import React, { useState } from 'react';
import { useGetAQIDataQuery } from '../api/api';
import OverallAQIChart from './OverallAQIChart';
import PM25Chart from './PM25Chart';
import PM10Chart from './PM10Chart';
import 'chart.js/auto';

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(100); // Default data points
    const { data = [], error, isLoading } = useGetAQIDataQuery(dataPoints);

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    // Create a reversed copy of the data for chronological order
    const slicedData = data.slice().reverse();

    return (
        <div>
            <h2>AQI Data Over Time</h2>

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

            {/* Render each chart with sliced data */}
            <OverallAQIChart data={slicedData} />
            <PM25Chart data={slicedData} />
            <PM10Chart data={slicedData} />
        </div>
    );
};

export default AQIChart;
