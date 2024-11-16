import React, { useState, useEffect } from 'react';
import { Layout, Select, Drawer, Button, Typography, Form, Tag, Space, Alert, Spin } from 'antd';
import { useGetAQIDataQuery } from '../api/api';
import { useGetZPHS01BDataQuery } from '../api/api-zphs01bApi';
import { AQIData, ZPHS01BData } from '../types/aqiData';
import AQIContent from './AQIContent';
import MobileAQIContent from './MobileAQIContent';
import AQITrendReportModal from './AQITrendReportModal';
import { useTrackEventMutation } from '../api/api-tracking';
import styles from './AQIChart.module.css';

const { Header, Footer } = Layout;
const { Title } = Typography;
const { Option } = Select;

// Define time range options
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
  { label: '96 Hours - 4 day', value: 96 },
  { label: '120 Hours - 5 day', value: 120 },
  { label: '144 Hours - 6 day', value: 144 },
  { label: '168 Hours - 7 day', value: 168 },
];

// Helper function to convert JSON data to CSV
const exportToCSV = (data: AQIData[], filename = 'chart_data.csv') => {
  const csvContent = [
    ['Timestamp', 'PM2.5 AQI', 'PM10 AQI', 'PM2.5 # µg/m³', 'PM10 # µg/m³', 'Average AQI'],
    ...data.map((item) => [
      item.timestamp,
      item.aqi_pm25,
      item.aqi_pm10,
      item.pm25,
      item.pm10,
      (item.aqi_pm25 + item.aqi_pm10) / 2,
    ]),
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
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const toggleDrawer = async () => {
    setDrawerVisible(!drawerVisible);
    await trackEvent('open_search_and_setting_button_clicked');
  };

  const { data = [], error, isLoading, refetch } = useGetAQIDataQuery({ limit: dataPoints });
  const { data: vocData = [], error: vocError, isLoading: vocLoading, refetch: refetchVoc } = useGetZPHS01BDataQuery({ limit: dataPoints });

  const handleExport = async () => {
    if (isMobile) {
      setShowBanner(true);
      await trackEvent('export_data_as_csv_denied');
    } else {
      exportToCSV(data);
      await trackEvent('export_data_as_csv_allowed');
    }
  };

  const handleRefresh = async () => {
    setIsLoadingRefresh(true);
    await refetch();
    await refetchVoc();
    setIsLoadingRefresh(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  if (isLoading || vocLoading) return <Spin tip="Loading data..." />;
  if (error || vocError) return <Alert message="Error loading data" type="error" />;

  const currentTime = new Date().getTime();
  const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;
  const filteredData = data.filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime);
  const filteredVocData = vocData.filter((item: ZPHS01BData) => new Date(item.timestamp).getTime() >= cutoffTime);

  return (
    <Layout className={styles.aqiChartLayout}>
      <Header className={styles.aqiHeader}>
        <Title level={3} className={styles.aqiTitle}>Tridasa AQI Monitor</Title>
      </Header>
      <Layout className={styles.settingsContainer}>
        {isLoadingRefresh && <div className={styles.spinnerOverlay}><Spin size="large" /></div>}
        {showBanner && (
          <Alert message="CSV download is available only on desktop." type="info" showIcon closable />
        )}
        <div className={styles.buttonContainer}>
          <Button type="primary" onClick={toggleDrawer} className={styles.drawerButton}>Search & Settings</Button>
          <Button type="primary" onClick={handleExport} className={styles.csvButton}>Export CSV</Button>
        </div>
        <div className={styles.filterTags}>
          <Space>
            <Tag color="blue">Data Points: {dataPoints}</Tag>
            <Tag color="green">Time Range: {timeRange} Hours</Tag>
          </Space>
        </div>
        <AQITrendReportModal data={filteredData} />
        <Button type="default" onClick={handleRefresh}>Refresh</Button>
        <Drawer
          title="Search & Settings"
          placement={isMobile ? 'top' : 'right'}
          width={isMobile ? '100%' : 300}
          onClose={toggleDrawer}
          visible={drawerVisible}
        >
          <Form layout="vertical">
            <Form.Item label="Select Data Points">
              <Select value={dataPoints} onChange={setDataPoints}>
                {[100, 500, 1000, 2000, 5000].map(point => (
                  <Option key={point} value={point}>{point}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Select Time Range">
              <Select value={timeRange} onChange={setTimeRange}>
                {timeRangeOptions.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            {isMobile && <Button type="primary" onClick={toggleDrawer} block>Apply</Button>}
          </Form>
        </Drawer>
        {isMobile ? (
          <MobileAQIContent data={filteredData} zpsh01b_data={filteredVocData} />
        ) : (
          <AQIContent data={filteredData} zpsh01b_data={filteredVocData} />
        )}
      </Layout>
      <Footer>
        <p>Contact: <a href="mailto:admin@tridasa.online">admin@tridasa.online</a> | WhatsApp: <a href="https://wa.me/918884111837">+91-8884111837</a></p>
      </Footer>
    </Layout>
  );
};

export default AQIChart;
