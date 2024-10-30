import React, { useState, useEffect } from 'react';
import { Layout, Select, Drawer, Button, Typography, Form, theme, Tag, Space } from 'antd';

import { useGetAQIDataQuery } from '../api/api';
import { AQIData } from '../types/aqiData';
import AQIContent from './AQIContent';
import MobileAQIContent from './MobileAQIContent';
import MobileAQISummary from './MobileAQISummary';
import 'chart.js/auto';
import './AQIChart.css';  // Add custom CSS for responsive styling

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Space component for adding spacing between charts
// const Space = ({ height = '20px' }) => <div style={{ height }} />;

// Options for time ranges in hours
const timeRangeOptions = [
    { label: '1 Hour', value: 1 },
    { label: '4 Hours', value: 4 },
    { label: '8 Hours', value: 8 },
    { label: '12 Hours', value: 12 },
    { label: '16 Hours', value: 16 },
    { label: '20 Hours', value: 20 },
    { label: '24 Hours - 1 day', value: 24 },
    { label: '36 Hours - 1.5 day', value: 36 },
    { label: '48 Hours - 2 day', value: 48 },
    { label: '72 Hours - 3 day', value: 72 },
    { label: '96 Hours - 4 day' , value: 96 },
    { label: '120 Hours - 5 day', value: 120 },
    { label: '144 Hours - 6 day', value: 144 },
    { label: '168 Hours - 7 day', value: 168 },
];

// Helper function to convert JSON data to CSV format
const exportToCSV = (data: AQIData[], filename = 'chart_data.csv') => {
    const csvContent = [
        ['Timestamp', 'PM2.5 AQI', 'PM10 AQI', 'PM2.5 # µg/m³', 'PM10 # µg/m³', 'Average  AQI'],
        ...data.map((item) => [
            item.timestamp,
            item.aqi_pm25,
            item.aqi_pm10,
            item.pm25,
            item.pm10,
            (item.aqi_pm25 + item.aqi_pm10) / 2
        ])
    ]
        .map((e) => e.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(5000);
    const [timeRange, setTimeRange] = useState(48);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const toggleDrawer = () => setDrawerVisible(!drawerVisible);

    const { data = [], error, isLoading } = useGetAQIDataQuery({ limit: dataPoints });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        // Clean up the event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const {
        token: { colorBgContainer, borderRadiusLG },
      } = theme.useToken();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;
    const filteredData = data
        .slice()
        .reverse()
        .filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime);

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{ backgroundColor: '#001529', padding: '0 20px' }}>
            {/* <Header style={{ display: 'flex', alignItems: 'center' }}> */}
                <Title level={2} style={{ color: '#fff', margin: 0 }}>
                {/* <Title> */}
                    AQI Monitoring Dashboard using SDS011 Sensor
                </Title>
            </Header>
            <Layout style={{ padding: '24px 0', background: colorBgContainer, borderRadius: borderRadiusLG }} >

                {/* Container for the Settings Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-start'}}>
                    <Button type="primary" onClick={toggleDrawer} style={{ marginTop: '20px' }} >
                        Open Search & Settings
                    </Button>

                    <Button
                            type="primary"
                            onClick={() => exportToCSV(filteredData)}
                            style={{ marginTop: '20px', marginLeft: '40px' }}
                        >
                            Export Data as CSV
                    </Button>

                    {/* Applied Filters Section */}
                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '40px'}}>
                        <label style={{ fontWeight: 'bold', marginBottom: '5px' }}>Applied Filters:</label>
                        <div style={{ 
                            backgroundColor: '#fafafa', 
                            border: '1px solid #d9d9d9', 
                            padding: '8px', 
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center' 
                        }}>
                            <Space>
                                <Tag color="blue">Data Points: {dataPoints}</Tag>
                                <Tag color="green">Time Range: {timeRange} Hours</Tag>
                            </Space>
                        </div>
                    </div>

                    {/* <Title level={2}>AQI Data Over Time</Title> */}
                </div>
                <Drawer
                    title="Search & Settings"
                    placement="right"
                    width={300}
                    onClose={toggleDrawer}
                    visible={drawerVisible}
                >
                    <Form layout="vertical">
                        <Form.Item label="Select Data Points">
                            <Select
                                value={dataPoints}
                                onChange={(value) => setDataPoints(value)}
                                style={{ width: '100%' }}
                            >
                                {[100, 200, 500, 1000, 2000, 2880, 5760, 10000].map((point) => (
                                    <Option key={point} value={point}>
                                        {point}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Select Time Range">
                            <Select
                                value={timeRange}
                                onChange={(value) => setTimeRange(value)}
                                style={{ width: '100%' }}
                            >
                                {timeRangeOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Button
                            type="primary"
                            onClick={() => exportToCSV(filteredData)}
                            style={{ width: '100%', marginTop: '20px' }}
                        >
                            Export Data as CSV
                        </Button>
                    </Form>
                </Drawer>
                {/* Other Layout content */}
                {/* <AQIContent data={filteredData} /> */}
                {/* {isMobile ? <MobileAQISummary data={data[data.length - 1]} /> : <AQIContent data={data} />} */}
                {isMobile ? <MobileAQIContent data={data} /> : <AQIContent data={data} />}
            </Layout>
        </Layout>
    );
};

export default AQIChart;