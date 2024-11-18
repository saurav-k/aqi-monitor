import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi';
import './VOCIndicatorCard.css';

const { Title } = Typography;

// Helper function to get VOC color based on average VOC value
const getVOCColor = (avgVoc: number) => {
    if (avgVoc < 1) return '#C8E6C9'; // Safe - Lighter green
    if (avgVoc < 2) return '#FFF9C4'; // Warning - Lighter yellow
    if (avgVoc < 3) return '#FFF9C4'; // High Warning - Lighter orange
    return '#FFE0B2'; // Hazardous - Light red (already light)
    // return '#FFCDD2'; // Hazardous - Light red (already light)
};

// Helper function to get VOC status text based on average VOC value
const getVOCStatus = (avgVoc: number) => {
    if (avgVoc < 1.5) return 'Safe';
    if (avgVoc < 2) return 'Moderate';
    if (avgVoc < 3) return 'Moderate';
    return 'Warning';
};

const VOCIndicatorCard: React.FC = () => {
    const { data, error, isLoading, refetch, isFetching } = useGetZPHS01BDataQuery({ limit: 5000 });
    const [avgVoc, setAvgVoc] = useState<number>(0);


    useEffect(() => {
        if (data && data.length > 0) {
            const topData = data.slice(0, 10);
            // Calculate the average VOC from the last 3 data points
            const totalVoc = topData.reduce((sum, item) => sum + item.voc, 0);
            const averageVoc = totalVoc / topData.length;
            // console.log(topData)
            // console.log(data)
            setAvgVoc(averageVoc);
        }
    }, [data]);

    const vocColor = getVOCColor(avgVoc);
    const vocStatus = getVOCStatus(avgVoc);
    const cardClass = avgVoc >= 3 ? 'hazardous-animation' : '';

    // Refresh data function
    const refreshData = () => {
        refetch(); // Refetches data from the API
    };

    if (isLoading || isFetching) return <Spin tip="Loading..." />;
    if (error) return <p>Error fetching VOC data</p>;

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
            <Title level={5}>Last 10 minute Average VOC Level: {avgVoc.toFixed(2)}</Title>
            <Title level={5}>{vocStatus}</Title>
            <Title level={4}>VOC Status</Title>

            {/* Refresh Button with icon */}
            <Button
                onClick={refreshData}
                type="primary"
                style={{ marginTop: '10px' }}
                icon={<ReloadOutlined />}
            >
                Refresh Data
            </Button>
        </Card>
    );
};

export default VOCIndicatorCard;
