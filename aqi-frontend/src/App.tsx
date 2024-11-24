import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import AQIChart from './components/AQIChart/AQIChart';
import Reports from './components/Reports/ReportsComponent';
import HeaderComponent from './components/Common/Header';

const { Content } = Layout;

const App: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <Layout style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <HeaderComponent isMobile={isMobile} />

        {/* Main Content */}
        <Content style={getContentStyle(isMobile)}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<AQIChart />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Content>
      </Layout>
    </Router>
  );
};

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
};

// Adjusted Content Style
const getContentStyle = (isMobile: boolean): React.CSSProperties => ({
  flex: 1,
  overflowY: 'auto',
  padding: isMobile ? '8px' : '16px',
  background: isMobile ? '#fff' : '#f0f2f5',
  margin: 0, // Explicitly remove margins
});

export default App;
