import React, { useState, useEffect } from 'react';
import { Flex, Layout, Alert, Spin, theme } from 'antd';
import { useGetAQIDataQuery } from '../../api/api';
import { AQIData, ZPHS01BData } from '../../types/aqiData';
import { useGetZPHS01BDataQuery } from '../../api/api-zphs01bApi';
import { useTrackEventMutation } from '../../api/api-tracking';
import HeaderComponent from './Header';
import FooterComponent from './Footer';
import DrawerForm from './DrawerForm';
import SettingsSection from './SettingsSection';
import { exportToCSV } from './ExportUtils';
import AQIContent from '../AQIContent';
import MobileAQIContent from '../MobileAQIContent';
import './AQIChart.css';

// import AQITrendReportModal from '../AQITrendReportModal';
// import {  Select, Drawer, Button, Typography, Form, Tag, Space} from 'antd';

const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
};

const AQIChart: React.FC = () => {
    const [dataPoints, setDataPoints] = useState(5000);
    const [timeRange, setTimeRange] = useState(48);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);
    const [showBanner, setShowBanner] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [trackEvent] = useTrackEventMutation();

    const { data = [], error, isLoading, refetch } = useGetAQIDataQuery({ limit: dataPoints });

    const { data: vocData = [], error: isVocError, isLoading: isVocLoading, refetch: refetch_voc } = useGetZPHS01BDataQuery({ limit: dataPoints });

    const toggleDrawer = async () => {
        setDrawerVisible(!drawerVisible);
        await trackEvent("open_search_and_setting_button_clicked");
   }

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
        await refetch_voc();
        setIsLoadingRefresh(false);
    };

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setDataPoints(isMobile ? 5000 : 5000);
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
    // Handle loading and error states
    if (isVocLoading) return <Spin tip="Loading VOC data..." />;
    if (isVocError) return <Alert message="Error fetching VOC data" type="error" />;


    const currentTime = new Date().getTime();
    const cutoffTime = currentTime - timeRange * 60 * 60 * 1000;

    const filteredData = data
    .slice()
    .filter((item: AQIData) => new Date(item.timestamp).getTime() >= cutoffTime)
    .reverse();

    const filtered_zpsh01b_data = vocData
        .slice()
        .filter((item: ZPHS01BData) => new Date(item.timestamp).getTime() >= cutoffTime)
        .reverse();

    return (
        <Flex gap="middle" wrap>
        <Layout style={layoutStyle}>
            <HeaderComponent isMobile={isMobile}/>
            <Layout style={{ background: colorBgContainer, borderRadius: borderRadiusLG }}>
                {isLoadingRefresh && (
                        <div className="spinner-overlay">
                            <Spin tip="Loading..." size="large" />
                        </div>
                )}

                <SettingsSection
                    dataPoints={dataPoints}
                    setDataPoints={setDataPoints}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    handleRefresh={handleRefresh}
                    handleExport={handleExport}
                    toggleDrawer={() => setDrawerVisible(!drawerVisible)}
                    showBanner={showBanner}
                    isMobile={isMobile}
                    filteredData = {filteredData}
                />
                {isMobile ? (
                    <MobileAQIContent data={filteredData} zpsh01b_data={filtered_zpsh01b_data} />
                ) : (
                    <AQIContent data={filteredData} zpsh01b_data={filtered_zpsh01b_data} />
                )}
                <DrawerForm
                    drawerVisible={drawerVisible}
                    setDrawerVisible={setDrawerVisible}
                    dataPoints={dataPoints}
                    setDataPoints={setDataPoints}
                    timeRange={timeRange}
                    setTimeRange={setTimeRange}
                    isMobile= {isMobile}
                    toggleDrawer= {toggleDrawer}
                />
            </Layout>
            <FooterComponent />
        </Layout>
        </Flex>
    );
};

export default AQIChart;
