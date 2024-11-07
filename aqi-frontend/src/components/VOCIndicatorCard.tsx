import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin } from 'antd';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi'; // Import the API hook
import './VOCIndicatorCard.css'; // Import your CSS file

const { Title } = Typography;

const getVOCColor = (voc: number) => {
    if (voc === 0) return '#A5D6A7'; // Lighter green for safe
    if (voc === 1) return '#FFEE58'; // Lighter yellow for warning
    if (voc === 2) return '#FFAB91'; // Lighter orange for higher warning
    return '#FFCDD2'; // Light red for hazardous (voc = 3)
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
    const cardClass = voc === 3 ? 'hazardous-animation' : '';

    return (
        <Card
            className={cardClass}
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
            <Title level={5}>
                {voc === 0 ? 'Safe' : voc === 1 ? 'Warning' : voc === 2 ? 'High Warning' : 'Hazardous'}
            </Title>
            <Title level={4}>VOC Status</Title>
        </Card>
    );
};

export default VOCIndicatorCard;
