import React from 'react';
import { Line } from 'react-chartjs-2';
import { AQIData } from '../types/aqiData';
import '../chartConfig'; 

interface Props {
    data: AQIData[];
}

const PM10ChartRaw: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.map((item) => new Date(item.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: 'PM10',
                data: data.map((item) => item.pm10),
                fill: false,
                borderColor: 'rgba(153,102,255,1)',
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
            <h3>PM10 Levels in ( # µg/m³ )</h3>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default PM10ChartRaw;
