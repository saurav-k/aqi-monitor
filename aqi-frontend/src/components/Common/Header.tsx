import React from 'react';
import { Layout, Typography, Menu, Dropdown, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

const getHeaderStyle = (isMobile: boolean): React.CSSProperties => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#fff',
  height: isMobile ? 56 : 64,
  padding: isMobile ? '0 16px' : '0 24px',
  lineHeight: isMobile ? '56px' : '64px',
  backgroundColor: '#001529',
});

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
    placement="bottomRight"
  >
    <Button
      icon={<MenuOutlined />}
      type="primary"
      style={{
        backgroundColor: '#001529',
        border: 'none',
      }}
      aria-label="Navigation Menu"
    />
  </Dropdown>
);

interface HeaderComponentProps {
  isMobile: boolean;
}

const HeaderComponent: React.FC<HeaderComponentProps> = ({ isMobile }) => {
  const navigate = useNavigate();

  return (
    <Header style={getHeaderStyle(isMobile)}>
      <Title level={isMobile ? 5 : 3} style={{ margin: 0 }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
          Tridasa AQI Monitor
        </Link>
      </Title>
      {isMobile ? <MobileMenu navigate={navigate} /> : <DesktopMenu navigate={navigate} />}
    </Header>
  );
};

export default HeaderComponent;
