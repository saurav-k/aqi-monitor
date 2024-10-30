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
import MobileHourlyMaxAQIChart from './MobileHourlyMaxAQIChart';

import './AQIChart.css'; 

interface AQIContentProps {
    data: AQIData[];
}

const MobileAQIContent: React.FC<AQIContentProps> = ({ data }) => {
    return (
        <Content style={{ padding: '20px', overflow: 'auto' }} >
            {/* <div style={{ width: '90%', margin: '20px auto' }}> */}
                <MobileAQISummary data={data[data.length - 1]} />
                <MobileHourlyMaxAQIChart data={data} />
            {/* </div> */}
            {/* <div style={{ width: '90%', margin: '20px auto' }}> */}
                {/* <MobileAQISummary data={data[data.length - 1]} /> */}
            {/* </div> */}
        </Content>
    );
};

export default MobileAQIContent;
