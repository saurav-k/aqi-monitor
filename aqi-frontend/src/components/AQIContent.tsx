import React from 'react';
import { Content } from 'antd/lib/layout/layout';
import SmoothAQI from './SMOOTHAQI';
import PM25ChartRaw from './PM25ChartRAW';
import PM10ChartRaw from './PM10ChartRAW';
import VOCChart from './charts/VOCChart';
import { AQIData, ZPHS01BData } from '../types/aqiData';
import MobileAQISummary from './MobileAQISummary';
import MobileVOCChart from './charts/MobileVOCChart';

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

const AQIContent: React.FC<AQIContentProps> = ({ data, zpsh01b_data }) => {
    const averageOfLastFive = calculateAverageAQI(data);
    
    return (
        <Content style={{ padding: '20px', overflow: 'auto' }} className="desktop-only">
            {/* <MobileHourlyMaxAQIChart data={data} /> */}
            {/* <MobileHourlyMaxAQIChart data={data} /> */}
            <MobileAQISummary data={data[data.length - 1]} averageOfLastFive={averageOfLastFive} />
            {/* <AQITrendMessage data={data} /> */}
            {zpsh01b_data && ( // Render VOCChart only if zpsh01b_data is provided
                <div style={{ width: '90%', margin: '20px auto' }}>
                    <VOCChart data={zpsh01b_data} />
                </div>
            )}

            {zpsh01b_data && ( // Render MobileVOCChart only if zpsh01b_data is provided
                <div style={{ width: '90%', margin: '20px auto' }}>
                    <MobileVOCChart data={zpsh01b_data} />
                </div>
            )}
            <div style={{ width: '90%', margin: '20px auto' }}>
                <SmoothAQI data={data} />
            </div>

            {/* <div style={{ width: '90%', margin: '20px auto' }}>
                <OverallAQIChart data={data} />
            </div> */}
            {/* <div style={{ width: '90%', margin: '20px auto' }}>
                <PM25Chart data={data} />
            </div>
            <div style={{ width: '90%', margin: '20px auto' }}>
                <PM10Chart data={data} />
            </div> */}
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
