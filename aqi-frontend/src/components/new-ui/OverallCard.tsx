import React from 'react';
import { Card, Typography, Row, Col, Image } from 'antd';
import './CardComponent.css';

const { Title, Text } = Typography;

const OverallCard: React.FC = () => {
    return (
        <Card className="card-location" bordered={false}>
            <Title level={1} className="card-location-name">
                Hyderabad US Consulate Air Quality Index (AQI) | Hyderabad
            </Title>
            <Text className="card-location-cityCon">
                Real-time PM2.5, PM10 air pollution in
            </Text>
            <Text className="card-location-time">
                Last Updated: 07 Nov 2024, 04:00pm
            </Text>
            <Row>
                <Col span={14} className="new-order">
                    <div className="imagetextdata-aqitext aqiIn" style={{ backgroundColor: '#D4CC0F' }}>
                        Moderate
                    </div>
                </Col>
                <Col span={10} className="d-flex align-items-center justify-content-end">
                    <div className="text-center">
                        <h4 className="card-no-value aqiIn" style={{ color: '#D4CC0F' }}>91</h4>
                        <p className="card-no-value-p aqiIn">(AQI-IN)</p>
                    </div>
                    <div className="cartton_shape_img">
                        <Image
                            src="https://www.aqi.in/assets/images/moderate-aqi-boy.png"
                            alt="AQI Icon"
                            preview={false}
                            className="card-img-icon"
                        />
                    </div>
                </Col>
            </Row>
            <div className="card-img-in curr" style={{ backgroundImage: 'url(https://www.aqi.in/assets/images/india_map_shape_new_3.png)' }}></div>
        </Card>
    );
};

export default OverallCard;
