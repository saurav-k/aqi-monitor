import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useGetAQIDataQuery } from '../api/api';
import 'chart.js/auto';

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(100); // Default data points
    const { data = [], error, isLoading } = useGetAQIDataQuery();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    // Slice the data based on the selected number of data points and reverse it for chronological order
    const slicedData = data.slice(0, dataPoints).reverse();

    // Generate data for each chart
    const aqiData = {
        labels: slicedData.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'Overall AQI',
                data: slicedData.map((item) => (item.aqi_pm25 + item.aqi_pm10) / 2),
                fill: false,
                borderColor: 'rgba(255,99,132,1)',
                tension: 0.1
            }
        ]
    };

    const pm25Data = {
        labels: slicedData.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM2.5',
                data: slicedData.map((item) => item.aqi_pm25),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    const pm10Data = {
        labels: slicedData.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM10',
                data: slicedData.map((item) => item.aqi_pm10),
                fill: false,
                borderColor: 'rgba(153,102,255,1)',
                tension: 0.1
            }
        ]
    };

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

            {/* Render each chart separately in the specified order */}
            <div>
                <h3>Overall AQI</h3>
                <Line data={aqiData} />
            </div>

            <div>
                <h3>PM2.5 Levels</h3>
                <Line data={pm25Data} />
            </div>

            <div>
                <h3>PM10 Levels</h3>
                <Line data={pm10Data} />
            </div>
        </div>
    );
};

export default AQIChart;
