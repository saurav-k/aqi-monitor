import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi';
import './VOCIndicatorCard.css';

const { Text, Title } = Typography;

const calculateSlope = (data: AQIData[]) => {
    const n = data.length;
    const sumX = data.reduce((sum, _, idx) => sum + idx, 0);
    const sumY = data.reduce((sum, point) => sum + point.overall_aqi, 0);
    const sumXY = data.reduce((sum, point, idx) => sum + idx * point.overall_aqi, 0);
    const sumX2 = data.reduce((sum, _, idx) => sum + idx * idx, 0);

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
};

// Helper function to get VOC color based on average VOC value
const getVOCColor = (avgVoc: number) => {
    if (avgVoc < 1.3) return '#C8E6C9'; // Safe - Lighter green
    if (avgVoc < 2) return '#FFF9C4'; // Warning - Lighter yellow
    if (avgVoc < 2.8) return '#FFF9C4'; // High Warning - Lighter orange
    return '#FFCDD2'; // Hazardous - Light red (already light)
    // return '#FFCDD2'; // Hazardous - Light red (already light)
};

// Helper function to get VOC status text based on average VOC value
const getVOCStatus = (avgVoc: number) => {
    if (avgVoc < 1.3) return 'Safe';
    if (avgVoc < 2) return 'Moderate';
    if (avgVoc < 2.8) return 'Moderate';
    return 'High';
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
    
    // Fetch VOC data using the API hook
    const { data: vocData, isLoading: isVocLoading } = useGetZPHS01BDataQuery({ limit: 5000 });
    const topData = vocData?.slice(0, 10);
    const vocAverage = topData && topData.length > 0
        ? topData.reduce((sum, item) => sum + item.voc, 0) / topData.length
        : 0;


    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - 30 * 60 * 1000;

    const recentData = data.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);

    if (recentData.length < 2) {
        return <Text>No sufficient data available to determine AQI trend.</Text>;
    }

    const slope = calculateSlope(recentData);
    const avgAQI = recentData.reduce((sum, point) => sum + point.overall_aqi, 0) / recentData.length;
    const maxAQI = Math.max(...recentData.map(point => point.overall_aqi));
    const minAQI = Math.min(...recentData.map(point => point.overall_aqi));
    const latestAQI = recentData[recentData.length - 1].overall_aqi;

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
