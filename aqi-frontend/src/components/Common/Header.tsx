import React from 'react';
import { Layout, Typography, Menu, Dropdown, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Common.css'; // Add custom CSS for responsive styling

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

const DesktopMenu: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
    <Menu
        mode="horizontal"
        theme="dark"
        style={menuStyle}
        onClick={({ key }) => navigate(key)}
        items={[
            { key: '/', label: 'Home' },
            { key: '/reports', label: 'Reports' },
        ]}
    />
);

const MobileMenu: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => (
    <Dropdown
        overlay={
            <Menu
                onClick={({ key }) => navigate(key)}
                items={[
                    { key: '/', label: 'Home' },
                    { key: '/reports', label: 'Reports' },
                ]}
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
    const navigate = useNavigate();

    return (
        <Header style={headerStyle}>
            <Title level={3} style={{ margin: 0, color: '#fff' }}>
                Tridasa AQI Monitor
            </Title>
            {isMobile ? <MobileMenu navigate={navigate} /> : <DesktopMenu navigate={navigate} />}
        </Header>
    );
};

export default HeaderComponent;
