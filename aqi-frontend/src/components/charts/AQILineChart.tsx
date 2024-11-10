import React from 'react';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
        console.error("Invalid date format:", timestamp);
        return "Invalid Date";
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHours = hours.toString().padStart(2, '0');

    return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
};

const getDarkAQIColors = () => [
    '#2E7D32', // Dark green for Good
    '#F9A825', // Dark yellow for Moderate
    '#EF6C00', // Dark orange for Unhealthy for Sensitive Groups
    '#D32F2F', // Dark red for Unhealthy
    '#7B1FA2', // Dark purple for Very Unhealthy
    '#4E342E'  // Dark maroon for Hazardous
];

const AQI_THRESHOLDS = [50, 100, 150, 200, 300, 500];

const getColorForAQI = (aqi: number) => {
    const colors = getDarkAQIColors();
    for (let i = 0; i < AQI_THRESHOLDS.length; i++) {
        if (aqi <= AQI_THRESHOLDS[i]) {
            return colors[i];
        }
    }
    return colors[colors.length - 1];
};

const calculateMarkerPosition = (aqi: number) => {
    const maxAQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
    const proportion = Math.min(aqi / maxAQI, 1); // Ensure proportion does not exceed 1
    return `${proportion * 100}%`; // Return percentage position
};

interface AQILineChartProps {
    avgAQI: number;
    timestamp: string;
}

const AQILineChart: React.FC<AQILineChartProps> = ({ avgAQI, timestamp }) => {
    const lineColor = getColorForAQI(avgAQI);
    const markerPosition = calculateMarkerPosition(avgAQI);

    return (
        <div style={{ position: 'relative', padding: '2px' }}>
            <Text style={{ fontSize: '14px', color: '#888888', display: 'block'}}>
                {`Data collected on: ${formatTimestamp(timestamp)}`}
            </Text>
            <Title level={4} style={{ marginBottom: '10px'}}>
                AQI Last 5-minute Average
            </Title>
            <Text
                style={{
                    fontSize: '24px',
                    color: lineColor,
                    fontWeight: 'bold',
                    display: 'block',
                    marginBottom: '10px',
                }}
            >
                {avgAQI.toFixed(0)}
            </Text>
            <div style={{ position: 'relative', height: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px', marginBottom: '20px' }}>
                <div
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: '100%',
                        background: `linear-gradient(to right, ${getDarkAQIColors().join(', ')})`,
                        borderRadius: '5px',
                    }}
                ></div>
                <div
                    style={{
                        position: 'absolute',
                        left: markerPosition,
                        top: '-10px',
                        width: '5px',
                        height: '40px',
                        backgroundColor: lineColor,
                        borderRadius: '2px',
                        transform: 'translateX(-50%)',
                    }}
                ></div>
            </div>
        </div>
    );
};

export default AQILineChart;
