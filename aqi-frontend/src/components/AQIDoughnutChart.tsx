import React, { useEffect, useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Typography } from 'antd';
import { ChartOptions } from 'chart.js';

const { Title, Text } = Typography;

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

interface AQIDoughnutChartProps {
    avgAQI: number;
    colors: string[];
    dataConfig: {
        labels: string[];
        datasets: Array<{
            data: number[];
            backgroundColor: string[];
            borderWidth: number;
            hoverBackgroundColor: string[];
            cutout: string;
        }>;
    };
    options: ChartOptions<'doughnut'>;
    AQI_THRESHOLDS: number[];
    timestamp: string;
}

const AQIDoughnutChart: React.FC<AQIDoughnutChartProps> = ({ avgAQI, colors, AQI_THRESHOLDS, dataConfig, timestamp }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    const options: ChartOptions<'doughnut'> = {
        rotation: -135,
        circumference: 270,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        const label = tooltipItem.label || '';
                        const index = tooltipItem.dataIndex;
                        const minThreshold = index === 0 ? 0 : AQI_THRESHOLDS[index - 1] + 1;
                        const maxThreshold = AQI_THRESHOLDS[index];
                        return `${label}: {${minThreshold} - ${maxThreshold}}`;
                    },
                },
            },
        },
    };

    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                // Determine the needle angle based on avgAQI
                let angle = -90; // Start at -90 degrees (leftmost point of the half-circle)
                for (let i = 0; i < AQI_THRESHOLDS.length - 1; i++) {
                    if (avgAQI <= AQI_THRESHOLDS[i + 1]) {
                        // Find the min and max AQI for this segment
                        const rangeMin = AQI_THRESHOLDS[i];
                        const rangeMax = AQI_THRESHOLDS[i + 1];
    
                        // Calculate the proportion of avgAQI within this range
                        const rangeProportion = (avgAQI - rangeMin) / (rangeMax - rangeMin);
    
                        // Calculate the angle within this segment
                        const segmentAngle = 180 / (AQI_THRESHOLDS.length - 1);
                        angle = -90 + i * segmentAngle + rangeProportion * segmentAngle;
                        break;
                    }
                }
    
                // Clear previous needle and draw new needle
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
                // Adjusted needle center position to the bottom center of the chart
                const centerX = canvasRef.current.width / 2;
                const centerY = canvasRef.current.height * 0.85; // Fixed to ensure bottom-center alignment
    
                // Draw the needle
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((Math.PI / 180) * angle);
                ctx.beginPath();
                ctx.moveTo(0, 0); // Start of needle at the center
                ctx.lineTo(0, -canvasRef.current.height * 0.6); // Length of needle
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'red';
                ctx.stroke();
                ctx.restore();
    
                // Draw needle base circle
                ctx.beginPath();
                ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        }
    }, [avgAQI]);
    
    

    return (
        <div style={{ position: 'relative', textAlign: 'center' }}>
            <Text style={{ fontSize: '14px', color: '#888888', display: 'block', marginBottom: '4px' }}>
                {`Data collected on: ${formatTimestamp(timestamp)}`}
            </Text>
            <Title level={4}>Realtime AQI</Title>
            <Text style={{
                fontSize: '24px',
                color: getColorForAQI(avgAQI),
                fontWeight: 'bold',
                display: 'block',
            }}>
                {avgAQI.toFixed(0)}
            </Text>
            <div style={{ width: '300px', height: '150px', margin: '0 auto', position: 'relative' }}>
                <Doughnut data={dataConfig} options={options} />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                />
            </div>
        </div>
    );
};

export default AQIDoughnutChart;
