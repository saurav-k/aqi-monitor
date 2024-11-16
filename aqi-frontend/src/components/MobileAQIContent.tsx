// AQIContent.tsx
import React from 'react';
import { Content } from 'antd/lib/layout/layout';
import { AQIData, ZPHS01BData } from '../types/aqiData';

import MobileAQISummary from './MobileAQISummary';
import MobileVOCChart from './charts/MobileVOCChart';
import MobileHourlyMaxAQIChart from './MobileHourlyMaxAQIChart';

import './AQIChart.css'; 

interface AQIContentProps {
    data: AQIData[];
    zpsh01b_data?: ZPHS01BData[]; // Marked as optional with ?
}

// Helper function to calculate the average AQI of the last 5 data points
const calculateAverageAQI = (data: AQIData[]): number => {
    const lastFiveData = data.slice(-5); // Get the last 5 readings
    const totalAQI = lastFiveData.reduce((sum, entry) => sum + entry.overall_aqi, 0);
    return totalAQI / lastFiveData.length;
};

const MobileAQIContent: React.FC<AQIContentProps> = ({ data, zpsh01b_data }) => {
    const averageOfLastFive = calculateAverageAQI(data);

    return (
        <Content style={{ padding: '20px', overflow: 'auto' }} >
            {/* <div style={{ width: '90%', margin: '20px auto' }}> */}
                <MobileAQISummary data={data[data.length - 1]} averageOfLastFive={averageOfLastFive} />
                {zpsh01b_data && ( // Render VOCChart only if zpsh01b_data is provided
                <div style={{ width: '90%', margin: '20px auto' }}>
                    <MobileVOCChart data={zpsh01b_data} />
                </div>
            )}
                <MobileHourlyMaxAQIChart data={data} />
            {/* </div> */}
            {/* <div style={{ width: '90%', margin: '20px auto' }}> */}
                {/* <MobileAQISummary data={data[data.length - 1]} /> */}
            {/* </div> */}
        </Content>
    );
};

export default MobileAQIContent;
