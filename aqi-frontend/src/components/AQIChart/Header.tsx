import React from 'react';
import { Layout, Typography } from 'antd';
import './AQIChart.css';  // Add custom CSS for responsive styling

const { Header } = Layout;
const { Title } = Typography;

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    height: 48,
    paddingInline: 24,
    lineHeight: '64px',
    backgroundColor: '#001529',
  };

const HeaderComponent: React.FC = () => (
    <Header style={headerStyle} >
        <Title level={3} className="header-title">Tridasa AQI Monitor</Title>
    </Header>
);

export default HeaderComponent;
