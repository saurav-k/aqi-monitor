import React, { useState } from 'react';
import dayjs from 'dayjs';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { DatePicker } from 'antd';
import { useGetZPHS01BDataQuery } from '../../api/api-zphs01bApi';
import { ZPHS01BData } from '../../types/aqiData';
import './MobileVOCChart.css';

ChartJS.register(...registerables, zoomPlugin);

const MobileVOCChart: React.FC = () => {
    const [hours, setHours] = useState(3); // Default to 3 hours
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today's date

    // Calculate start and end times for the query
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setHours(endDate.getHours() + hours);

    // Format dates for the API query
    const start_time = startDate.toISOString();
    const end_time = endDate.toISOString();

    // Fetch data using the API query with parameters
    const { data: apiData, error, isLoading } = useGetZPHS01BDataQuery({ start_time, end_time });

    // Function to handle dropdown change
    const handleHoursChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setHours(Number(event.target.value));
    };
    // Handle date picker change
    const handleDateChange = (date: any, dateString: string | string[]) => {
        if (typeof dateString === 'string') {
            setSelectedDate(dateString);
            setHours(24);
        }
    };

    // Filtered data for the chart
    const filteredData = apiData || [];

    const timestamps = filteredData.map((item: ZPHS01BData) => formatTimestamp(item.timestamp));
    const vocValues = filteredData.map((item: ZPHS01BData) => item.voc || 0);
    const dotColors = filteredData.map((item: ZPHS01BData) => getDotColor(item.voc || 0));

    // Chart.js data
    const chartData = {
        labels: timestamps,
        datasets: [
            {
                label: 'VOC Levels',
                data: vocValues,
                borderColor: 'white',
                borderWidth: 0.5,
                tension: 0.1,
                pointBackgroundColor: dotColors,
                pointBorderColor: 'transparent',
                pointRadius: 4,
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
            mode: 'index' as const,
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: false,
                min: -1,
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

    if (isLoading) return <p>Loading data...</p>;

    // Improved error handling
    if (error) {
        const errorMessage =
            'status' in error
                ? `Error: ${error.status}`
                : error.message || 'An unknown error occurred';
        return <p>{errorMessage}</p>;
    }

    return (
        <div className="MobileVOCChart-container">
            <h2>VOC Levels Over Time</h2>
            {/* Ant Design DatePicker for date selection */}
            <div className="horizontal-container">
            <div className="date-selector">
                <label htmlFor="date">Select Date: </label>
                <DatePicker
                    id="date"
                    onChange={handleDateChange}
                    style={{ marginRight: '10px' }}
                    disabledDate={(current) =>
                        current && (current.isBefore(dayjs('2024-11-08'), 'day') || current.isAfter(dayjs(), 'day'))
                    }
                />
            </div>
            {/* Ant Design Select for hours dropdown */}
            <div className="hours-selector">
                <label htmlFor="hours">Select Duration: </label>
                <select id="hours" value={hours} onChange={handleHoursChange}>
                    <option value={1}>1 Hour</option>
                    <option value={3}>3 Hours</option>
                    <option value={6}>6 Hours</option>
                    <option value={9}>9 Hours</option>
                    <option value={12}>12 Hours</option>
                    <option value={24}>24 Hours</option>
                    <option value={36}>36 Hours</option>
                    <option value={48}>48 Hours</option>
                </select>
            </div>
            </div>
            <div className="MobileVOCChart-chart">
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

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
    if (voc > 2) return '#b71c1c'; // Dark red for hazardous level
    if (voc === 2) return '#e65100'; // Dark orange for moderate level
    if (voc === 1) return '#f57f17'; // Dark yellow for mild level
    return '#1b5e20'; // Dark green for safe level
};

export default MobileVOCChart;
