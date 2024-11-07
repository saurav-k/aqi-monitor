import React from 'react';
import { Row, Col, Typography, Image } from 'antd';

const { Text } = Typography;

const AQIDetails: React.FC = () => {
    const pollutantData = [
        { icon: 'https://www.aqi.in/assets/images/pm2.5-icon.webp', value: 34, label: 'PM2.5', percentage: 13.6 },
        { icon: 'https://www.aqi.in/assets/images/pm10-icon.png', value: 91, label: 'PM10', percentage: 21.16 },
        { icon: 'https://www.aqi.in/assets/images/so2.png', value: 2, label: 'SO2', percentage: 0.33 },
        { icon: 'https://www.aqi.in/assets/images/CO.png', value: 454, label: 'CO', percentage: 0.65 },
        { icon: 'https://www.aqi.in/assets/images/o3.webp', value: 19, label: 'Ozone', percentage: 9.5 },
        { icon: 'https://www.aqi.in/assets/images/no2.png', value: 14, label: 'NO2', percentage: 1.12 },
    ];

    return (
        <Row className="card-Pollutants">
            <Col span={24} style={{ padding: '0', textAlign: 'center' }}>
                <Text className="card-Pollutants_Pollutants">Current Air Quality in Hyderabad US Consulate</Text>
                <Image
                    src="https://www.aqi.in/assets/images/live-rank-icon.png"
                    alt="Live Rank Icon"
                    preview={false}
                />
            </Col>
            {pollutantData.map((item, index) => (
                <Col span={24} key={index} className="card-Pollutants-sensor">
                    <div>
                        <Image
                            src={item.icon}
                            width={28}
                            height={28}
                            alt={`${item.label} icon`}
                            preview={false}
                        />
                    </div>
                    <div style={{ display: 'inline-block' }}>
                        <span className="Pollutants_sensor_text">{item.value}</span>
                        <Text className="Pollutants_sensor_text_s"> ({item.label})</Text>
                        <div className="d-flex">
                            <div style={{ border: '2px solid #F5EC00', background: '#F5EC00', width: `${item.percentage}%` }}></div>
                            <div style={{ border: '2px solid #F5EC00', background: '#F5EC00', opacity: 0.4, width: `${100 - item.percentage}%` }}></div>
                        </div>
                    </div>
                </Col>
            ))}
        </Row>
    );
};

export default AQIDetails;
