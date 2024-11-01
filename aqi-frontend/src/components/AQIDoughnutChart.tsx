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
                // Determine the proportional angle based on avgAQI
                const maxAQI = AQI_THRESHOLDS[AQI_THRESHOLDS.length - 1];
                const minAQI = AQI_THRESHOLDS[0];
                const angleRange = 270; // The total span of the gauge arc in degrees
    
                // Calculate proportion of avgAQI within the AQI range, then map to -135 to 135 degrees
                const proportion = (avgAQI - minAQI) / (maxAQI - minAQI);
                const angle = -135 + proportion * angleRange; // Map proportion to -135 to 135 degrees
    
                // Clear previous needle and draw new needle
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
                // Get the dynamic needle color based on AQI
                const needleColor = getColorForAQI(avgAQI);
    
                // Center of the chart
                const centerX = canvasRef.current.width / 2;
                const centerY = canvasRef.current.height / 2;
    
                // Draw the needle
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate((Math.PI / 180) * angle);
                ctx.beginPath();
                ctx.moveTo(0, 0); // Start of needle at the center
                ctx.lineTo(0, -canvasRef.current.height * 0.4); // Length of needle
                ctx.lineWidth = 2;
                ctx.strokeStyle = needleColor; // Apply dynamic color
                ctx.stroke();
                ctx.restore();
    
                // Draw needle base circle with the same color
                ctx.beginPath();
                ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
                ctx.fillStyle = needleColor; // Apply dynamic color
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
