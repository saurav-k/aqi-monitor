// AQITrendReport.tsx
import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import AQITrendMessage from './AQITrendMessage';
import { AQIData } from '../types/aqiData';
import { useTrackEventMutation } from '../api/api-tracking';
import style from "./AQITrendReportModal.module.css"

interface AQITrendReportProps {
    data: AQIData[];
}

const AQITrendReportModal: React.FC<AQITrendReportProps> = ({ data }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [trackEvent] = useTrackEventMutation();

    const showModal = async () => {
        setIsModalVisible(true);
        // Send tracking event when button is clicked
        await trackEvent("view_aqi_trend_report");
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    return (
        <div>
            <Button 
                onClick={showModal}
                className="aqi-trend-button"
                style={{ flex: 1 }}
            >
                View AQI Trend Report
            </Button>
            <Modal
                title="AQI Trend Report (Last 30 Minutes)"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                centered
            >
                <AQITrendMessage data={data} />
            </Modal>
        </div>
    );
};

export default AQITrendReportModal;
