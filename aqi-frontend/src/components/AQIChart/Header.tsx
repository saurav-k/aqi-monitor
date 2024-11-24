import React from 'react';
import { Layout, Typography, Menu, Dropdown, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import './AQIChart.css'; // Add custom CSS for responsive styling

const { Header } = Layout;
const { Title } = Typography;

const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#fff',
    height: 48,
    paddingInline: 24,
    lineHeight: '48px',
    backgroundColor: '#001529',
};

const menuStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
};

// Navigation items
const navigationItems = [
    { key: 'home', label: 'Home', href: '/' },
    { key: 'reports', label: 'Reports', href: '/reports' },
];

// Menu for desktop
const DesktopMenu: React.FC = () => (
    <Menu
        mode="horizontal"
        theme="dark"
        items={navigationItems.map((item) => ({
            key: item.key,
            label: <a href={item.href}>{item.label}</a>,
        }))}
        style={menuStyle}
    />
);

// Menu for mobile (dropdown)
const MobileMenu: React.FC = () => (
    <Dropdown
        overlay={
            <Menu
                items={navigationItems.map((item) => ({
                    key: item.key,
                    label: <a href={item.href}>{item.label}</a>,
                }))}
            />
        }
        trigger={['click']}
    >
        <Button icon={<MenuOutlined />} type="primary" />
    </Dropdown>
);

interface HeaderComponentProps {
    isMobile: boolean;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ isMobile }) => {
    return (
        <Header style={headerStyle}>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>
                Tridasa AQI Monitor
            </Title>
            {isMobile ? <MobileMenu /> : <DesktopMenu />}
        </Header>
    );
};

export default HeaderComponent;
