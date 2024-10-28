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

interface AQIContentProps {
    data: AQIData[];
}

const AQIContent: React.FC<AQIContentProps> = ({ data }) => {
    return (
        <Content style={{ padding: '20px', overflow: 'auto' }}>
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
