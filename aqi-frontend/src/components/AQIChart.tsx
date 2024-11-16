import React, { useState, useEffect } from 'react';
import { Flex, Layout, Select, Drawer, Button, Typography, Form, theme, Tag, Space, Alert, Spin } from 'antd';
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


const headerStyle: React.CSSProperties = {
  textAlign: 'center',
  color: '#fff',
  height: 48,
  paddingInline: 24,
  lineHeight: '64px',
  backgroundColor: '#001529',
};

const layoutStyle = {
  borderRadius: 8,
  overflow: 'hidden',
  // width: 'calc(50% - 8px)',
  // maxWidth: 'calc(50% - 8px)',
};
// Options for time ranges in hours

// Define timeRangeOptions
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
  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false); 
  const [isMobile, setIsMobile] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  const toggleDrawer = async () => {
    setDrawerVisible(!drawerVisible);
    await trackEvent("open_search_and_setting_button_clicked");
  };

  const { data = [], error, isLoading, refetch } = useGetAQIDataQuery({ limit: dataPoints });
  const { data: vocData = [], error: isVocError, isLoading: isVocLoading, refetch: refetch_voc } = useGetZPHS01BDataQuery({ limit: dataPoints });

  const handleExport = async () => {
    if (isMobile) { 
      setShowBanner(true);
      await trackEvent("export_data_as_csv_denied");
    } else { 
      exportToCSV(filteredData); 
      await trackEvent("export_data_as_csv_allowed");
    }
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const handleRefresh = async () => {
    setIsLoadingRefresh(true);
    await refetch();
    await refetch_voc();
    await sleep(10);
    setIsLoadingRefresh(false);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      handleResize(); // Set initial value
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const { token: { colorBgContainer, borderRadiusLG } } = theme.useToken();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;
  if (isVocLoading) return <Spin tip="Loading VOC data..." />;
  if (isVocError) return <Alert message="Error fetching VOC data" type="error" />;

  const currentTime = new Date().getTime();
  const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;
  const filteredData = data.filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime).reverse();
  const filtered_zpsh01b_data = vocData.filter((item: ZPHS01BData) => new Date(item.timestamp).getTime() >= cutoffTime).reverse();

  return (
    <Flex gap="middle" wrap>
      <Layout style={layoutStyle}>
        <Header style={headerStyle}>
          <Title level={3} className={styles.headerTitle}>Tridasa AQI Monitor</Title>
        </Header>
        <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {isLoadingRefresh && (
            <div className={styles.spinnerOverlay}>
              <Spin tip="Loading..." size="large" />
            </div>
          )}
          <div className={styles.settingsContainer}>
            {showBanner && (
              <Alert message="CSV download can be done from desktop." type="info" showIcon closable style={{ marginBottom: '20px' }} />
            )}
            <div className={styles.buttonGroup}>
              <Button type="primary" onClick={toggleDrawer} className={styles.drawerButton}>Open Search & Settings</Button>
              <Button type="primary" onClick={handleExport} className={styles.csvButton}>Export Data as CSV</Button>
            </div>
            <div className={styles.appliedFilters}>
              <label className={styles.filterLabel}>Applied Filters:</label>
              <div className={styles.filterBox}>
                <Space>
                  <Tag color="blue">Data Points: {dataPoints}</Tag>
                  <Tag color="green">Time Range: {timeRange} Hours</Tag>
                </Space>
              </div>
            </div>
            <div className={styles.buttonContainer}>
              <AQITrendReportModal data={filteredData} />
              <Button type="default" onClick={handleRefresh}>Refresh</Button>
            </div>
          </div>
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
                <Select value={dataPoints} onChange={setDataPoints} style={{ width: '100%' }}>
                  {[100, 200, 500, 1000, 2000, 2880, 5760, 10000].map((point) => (
                    <Option key={point} value={point}>{point}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Select Time Range">
                <Select value={timeRange} onChange={setTimeRange} style={{ width: '100%' }}>
                  {timeRangeOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </Form.Item>
              {isMobile && <Button type="primary" onClick={toggleDrawer} style={{ width: '100%', marginTop: '20px' }}>Apply</Button>}
            </Form>
          </Drawer>
          {isMobile ? (
            <MobileAQIContent data={filteredData} zpsh01b_data={filtered_zpsh01b_data} />
          ) : (
            <AQIContent data={filteredData} zpsh01b_data={filtered_zpsh01b_data} />
          )}
        </Layout>
        <Footer style={{ textAlign: 'center', padding: '10px 0' }}>
          Contact us at <a href="mailto:admin@tridasa.online">admin@tridasa.online</a> or WhatsApp at <a href="https://wa.me/918884111837" target="_blank" rel="noopener noreferrer">+91-8884111837</a>
        </Footer>
      </Layout>
    </Flex>
  );
};

export default AQIChart;
