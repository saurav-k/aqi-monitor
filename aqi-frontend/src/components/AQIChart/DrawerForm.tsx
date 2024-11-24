import React from 'react';
import { Drawer, Form, Select, Button } from 'antd';
import { timeRangeOptions } from './TimeRangeOptions';
import './AQIChart.css';  // Add custom CSS for responsive styling
const { Option } = Select;

interface DrawerFormProps {
    drawerVisible: boolean;
    setDrawerVisible: (visible: boolean) => void;
    dataPoints: number;
    setDataPoints: (value: number) => void;
    timeRange: number;
    setTimeRange: (value: number) => void;
    isMobile: boolean;
    toggleDrawer: () => void; 
}

const DrawerForm: React.FC<DrawerFormProps> = ({
    drawerVisible,
    setDrawerVisible,
    toggleDrawer,
    dataPoints,
    setDataPoints,
    timeRange,
    setTimeRange,
    isMobile
}) => (
    <Drawer
    title="Search & Settings"
    placement={isMobile ? "top" : "right"}
    width={isMobile ? "100%" : 300}
    onClose={toggleDrawer}
    open={drawerVisible}
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
);

export default DrawerForm;
