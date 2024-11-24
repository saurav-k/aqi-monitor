import React from 'react';
import { Button, Alert, Tag, Space } from 'antd';
import AQITrendReportModal from '../AQITrendReportModal';
import './AQIChart.css';  // Add custom CSS for responsive styling
import { AQIData } from '../../types/aqiData';

interface SettingsSectionProps {
    handleRefresh: () => void;
    handleExport: () => void;
    toggleDrawer: () => void;
    showBanner: boolean;
    isMobile: boolean;
    dataPoints: number;
    filteredData: AQIData[];
    setDataPoints: (value: number) => void;
    timeRange: number;
    setTimeRange: (value: number) => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
    handleRefresh,
    handleExport,
    toggleDrawer,
    showBanner,
    isMobile,
    dataPoints,
    filteredData,
    timeRange
}) => (
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
                Search & Settings
            </Button>

            <Button type="primary" onClick={handleExport} style={{ flex: 1 }}>
                Export Data
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
            {/* <WindRoseComponent/> */}
            <Button type="default" onClick={handleRefresh}>
                Refresh
            </Button>
        </div>
    </div>
);

export default SettingsSection;
