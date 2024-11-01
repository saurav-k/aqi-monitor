// AQIContent.tsx
import React from 'react';
import { Content } from 'antd/lib/layout/layout';
import SmoothAQI from './SMOOTHAQI';
import OverallAQIChart from './OverallAQIChart';
import PM25Chart from './PM25Chart';
import PM10Chart from './PM10Chart';
import PM25ChartRaw from './PM25ChartRAW';
import PM10ChartRaw from './PM10ChartRAW';
import { AQIData } from '../types/aqiData';
import MobileAQISummary from './MobileAQISummary';
// import AQITrendMessage from './AQITrendMessage';
// import MobileHourlyMaxAQIChart from './MobileHourlyMaxAQIChart';

import './AQIChart.css'; 

interface AQIContentProps {
    data: AQIData[];
}

// Helper function to calculate the average AQI of the last 5 data points
const calculateAverageAQI = (data: AQIData[]): number => {
    const lastFiveData = data.slice(-5); // Get the last 5 readings
    const totalAQI = lastFiveData.reduce((sum, entry) => sum + entry.overall_aqi, 0);
    return totalAQI / lastFiveData.length;
};

const AQIContent: React.FC<AQIContentProps> = ({ data }) => {
    const averageOfLastFive = calculateAverageAQI(data);
    
    return (
        <Content style={{ padding: '20px', overflow: 'auto' }} className="desktop-only">
            {/* <MobileHourlyMaxAQIChart data={data} /> */}
            {/* <MobileHourlyMaxAQIChart data={data} /> */}
            <MobileAQISummary data={data[data.length - 1]} averageOfLastFive={averageOfLastFive} />
            {/* <AQITrendMessage data={data} /> */}
            <div style={{ width: '90%', margin: '20px auto' }}>
                <SmoothAQI data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <OverallAQIChart data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <PM25Chart data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <PM10Chart data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <PM25ChartRaw data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <PM10ChartRaw data={data} />
            </div>
        </Content>
    );
};

export default AQIContent;
