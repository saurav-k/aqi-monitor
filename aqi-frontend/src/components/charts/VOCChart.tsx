import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, DotProps } from 'recharts';
import { ZPHS01BData } from '../../types/aqiData';

interface VOCChartProps {
    data: ZPHS01BData[];
}

// Helper function to format the timestamp for the X-axis
const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes() < 10 ? '0' : ''}${date.getMinutes()}`;
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
    
    // Check if payload exists and get the color
    const dotColor = payload ? getDotColor(payload.voc) : '#ccc';

    return (
        <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />
    );
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
                <YAxis domain={[-1, 4]} /> {/* Start Y-axis from -1 to show the default range */}
                <Tooltip />

                {/* Line component with color-coded dots */}
                <Line
                    type="monotone"
                    dataKey="voc"
                    stroke="#8884d8"
                    dot={<CustomDot />} // Custom dot component
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default VOCChart;