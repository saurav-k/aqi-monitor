// VOCIndicatorCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi'; // Import the API hook

const { Title } = Typography;

const getVOCColor = (voc: number) => {
    if (voc === 0) return '#2E7D32'; // Green for safe
    if (voc === 1) return '#F9A825'; // Warning yellow
    return '#D32F2F'; // Red for hazardous
};

const VOCIndicatorCard: React.FC = () => {
    const { data, error, isLoading } = useGetZPHS01BDataQuery({ limit: 2 });
    const [voc, setVoc] = useState<number>(0);

    useEffect(() => {
        if (data && data.length > 0) {
            // Take the latest data entry
            const latestData = data[0];
            setVoc(latestData.voc);
        }
    }, [data]);

    if (isLoading) return <Spin tip="Loading..." />;
    if (error) return <p>Error fetching VOC data</p>;

    const vocColor = getVOCColor(voc);

    return (
        <Card
            bordered={false}
            style={{
                textAlign: 'center',
                backgroundColor: vocColor,
                color: '#fff',
                padding: '10px',
                borderRadius: '8px',
            }}
        >
            <Title level={5}>VOC Level: {voc}</Title>
            <Title level={5}>{voc === 0 ? 'Safe' : voc === 1 ? 'Warning' : 'Hazardous'}</Title>
            <Title level={4}>VOC Status</Title>
        </Card>
    );
};

export default VOCIndicatorCard;
