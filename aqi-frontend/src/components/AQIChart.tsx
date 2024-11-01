import React, { useState, useEffect } from 'react';
import { Layout, Select, Drawer, Button, Typography, Form, theme, Tag, Space, Alert } from 'antd';

import { useGetAQIDataQuery } from '../api/api';
import { AQIData } from '../types/aqiData';
import AQIContent from './AQIContent';
import MobileAQIContent from './MobileAQIContent';
import AQITrendReportModal from './AQITrendReportModal';
import { useTrackEventMutation } from '../api/api-tracking';
import './AQIChart.css';  // Add custom CSS for responsive styling

const { Header } = Layout;
const { Title } = Typography;
const { Option } = Select;

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
    const [trackEvent] = useTrackEventMutation();


    const toggleDrawer = async () => {
         setDrawerVisible(!drawerVisible);
         await trackEvent("open_search_and_setting_button_clicked");
    }

    const { data = [], error, isLoading } = useGetAQIDataQuery({ limit: dataPoints });

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showBanner, setShowBanner] = useState(false);

    const handleExport = async () => {
        
        if (isMobile) { 
            setShowBanner(true);
            // Send tracking event when button is clicked
            await trackEvent("export_data_as_csv_denied");
        } else { 
            exportToCSV(filteredData); 
            await trackEvent("export_data_as_csv_allowed");
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setDataPoints(isMobile ? 10000 : 5000);
            setTimeRange(isMobile ? 96 : 48);
        };

        // Set initial values based on current window size
        handleResize();

        window.addEventListener('resize', handleResize);
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
        .filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime)
        .reverse();

    return (
        <Layout style={{ height: '100vh' }}>
            <Header className="header">
                <Title level={3} className="header-title">Tridasa AQI Monitor</Title>
            </Header>
            <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
                <div className="settings-container">
                {showBanner && (
                        <Alert
                            message="CSV download can be done from desktop."
                            type="info"
                            showIcon
                            closable
                            style={{ marginBottom: '20px' }}
                        />
                    )}
                    {/* Button Group */}
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px' }}>
                        <Button type="primary" onClick={toggleDrawer} style={{ flex: 1 }}>
                            Open Search & Settings
                        </Button>

                        <Button type="primary" onClick={handleExport} style={{ flex: 1 }}>
                            Export Data as CSV
                        </Button>
                    </div>

                    {/* Applied Filters Section */}
                    <div className="applied-filters">
                        <label className="filter-label">Applied Filters:</label>
                        <div className="filter-box">
                            <Space>
                                <Tag color="blue">Data Points: {dataPoints}</Tag>
                                <Tag color="green">Time Range: {timeRange} Hours</Tag>
                            </Space>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '20px',  marginLeft: '20px' }}>
                        <AQITrendReportModal data={filteredData} />
                    </div>
                </div>

                {/* Drawer with dynamic placement */}
                <Drawer
                    title="Search & Settings"
                    placement={isMobile ? "top" : "right"}
                    width={isMobile ? "100%" : 300}
                    onClose={toggleDrawer}
                    visible={drawerVisible}
                    bodyStyle={{ paddingBottom: isMobile ? '20px' : '40px' }}
                >
                    <Form layout="vertical">
                        <Form.Item label="Select Data Points">
                            <Select
                                value={dataPoints}
                                onChange={(value) => setDataPoints(value)}
                                style={{ width: '100%' }}
                            >
                                {[100, 200, 500, 1000, 2000, 2880, 5760, 10000].map((point) => (
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
                                {timeRangeOptions.map((option) => (
                                    <Option key={option.value} value={option.value}>{option.label}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {isMobile && (
                            <Button type="primary" onClick={toggleDrawer} style={{ width: '100%', marginTop: '20px' }}>
                                Apply
                            </Button>
                        )}
                    </Form>
                </Drawer>

                {isMobile ? <MobileAQIContent data={filteredData} /> : <AQIContent data={filteredData} />}
            </Layout>
        </Layout>
    );
};

export default AQIChart;
