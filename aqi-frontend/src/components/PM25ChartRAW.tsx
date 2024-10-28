import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import '../chartConfig'; 
import { formatTimestamp } from '../utils/dateUtils';

interface Props {
    data: AQIData[];
}

const PM25ChartRaw: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((item) => formatTimestamp(item.timestamp)),
        datasets: [
            {
                label: 'PM2.5',
                data: data.map((item) => item.pm25),
                fill: false,
                borderColor: 'rgba(75,192,192,1)',
                tension: 0.1
            }
        ]
    };

    const options = {
        responsive: true,
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'x' as const,  // specify mode as literal type
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true
                    },
                    mode: 'x' as const,  // specify mode as literal type
                }
            }
        }
    };

    return (
        <div>
            <h3>PM2.5 Levels in ( # µg/m³ )</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PM25ChartRaw;
