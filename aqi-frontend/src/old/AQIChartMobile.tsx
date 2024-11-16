import React, { useState } from 'react';
import { Layout, Select, Drawer, Button, Typography, Form, theme, Tag, Space } from 'antd';
import { useGetAQIDataQuery } from '../api/api';
import { AQIData } from '../types/aqiData';
import AQIContent from './AQIContent';
import 'chart.js/auto';
import styles from './AQIChart.module.css';  // Add custom CSS for responsive styling

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
    { label: '24 Hours', value: 24 },
    { label: '36 Hours', value: 36 },
    { label: '48 Hours', value: 48 },
    { label: '72 Hours', value: 72 },
    { label: '100 Hours', value: 100 },
    { label: '120 Hours', value: 120 },
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

const AQIChartMobile = () => {
    const [dataPoints, setDataPoints] = useState(2880);
    const [timeRange, setTimeRange] = useState(24);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const toggleDrawer = () => setDrawerVisible(!drawerVisible);
    const { data = [], error, isLoading } = useGetAQIDataQuery({ limit: dataPoints });
    const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error loading data</p>;

    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;
    const filteredData = data.filter(item => new Date(item.timestamp).getTime() >= cutoffTime);

    return (
        <Layout className="aqi-chart-layout">
            <Header className="aqi-header">
                
                <Title level={2} style={{ color: '#fff', margin: 0}}>AQI Monitoring Dashboard</Title>
            </Header>
            <Layout className="aqi-content">
                <div className="button-container">
                    <Button type="primary" onClick={toggleDrawer} className="drawer-button">
                        Settings
                    </Button>
                    <Button type="primary" onClick={() => exportToCSV(filteredData)} className="csv-button">
                        Export CSV
                    </Button>
                </div>
                <div className="filter-tags">
                    <Tag color="blue">Data Points: {dataPoints}</Tag>
                    <Tag color="green">Time Range: {timeRange} Hours</Tag>
                </div>
                <Drawer
                    title="Search & Settings"
                    placement="right"
                    width={250}
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
                                {[100, 200, 500, 1000, 2000, 2880, 5760, 10000].map(point => (
                                    <Option key={point} value={point}>{point}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Select Time Range">
                            <Select
                                value={timeRange}
                                onChange={(value) => setTimeRange(value)}
                                style={{ width: '100%' }}
                            >
                                {timeRangeOptions.map(option => (
                                    <Option key={option.value} value={option.value}>
                                        {option.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Form>
                </Drawer>
                <AQIContent data={filteredData} />
            </Layout>
        </Layout>
    );
};

export default AQIChartMobile;
