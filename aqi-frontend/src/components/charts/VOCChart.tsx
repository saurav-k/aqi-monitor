// VOCChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ZPHS01BData } from '../../types/aqiData';

interface VOCChartProps {
    data: ZPHS01BData[];
}

// Helper function to format the timestamp for the X-axis
const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
};

const VOCChart: React.FC<VOCChartProps> = ({ data }) => {
    // Prepare data for the chart, including timestamps and VOC levels
    const chartData = data.map((item) => ({
        timestamp: formatTimestamp(item.timestamp),
        voc: item.voc || 0, // Default to 0 if VOC data is not available
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="voc" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default VOCChart;
