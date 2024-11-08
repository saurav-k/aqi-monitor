import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, DotProps } from 'recharts';
import { ZPHS01BData } from '../../types/aqiData';

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

// Custom dot component
const CustomDot = (props: DotProps & { payload?: { voc: number } }) => {
    const { cx, cy, payload } = props;
    const dotColor = payload ? getDotColor(payload.voc) : '#ccc';

    return (
        <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />
    );
};

const VOCChart: React.FC<VOCChartProps> = ({ data }) => {
    const chartData = data.map((item) => ({
        timestamp: formatTimestamp(item.timestamp),
        voc: item.voc || 0,
    }));

    return (
        <div>
         {/* Add a title and description above the chart */}
            <h2>VOC Levels Over Time</h2>
            <p>This chart displays the variation in Volatile Organic Compound (VOC) levels throughout the day. The data points are color-coded based on the severity of the VOC level, ranging from safe (green) to hazardous (red).</p>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" angle={-45} textAnchor="end" dy={10} />
                    <YAxis domain={[-1, 4]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="voc" stroke="#8884d8" dot={<CustomDot />} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default VOCChart;
