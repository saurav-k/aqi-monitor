
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AQIChart from './components/AQIChart/AQIChart';
import Reports from './components/Reports/ReportsComponent';
import HeaderComponent from './components/Common/Header';

const layoutStyle: React.CSSProperties = {
    borderRadius: 8,
    overflow: 'hidden',
    height: '100vh',
};

const App: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <Router>
            <Layout style={layoutStyle}>
                {/* Header */}
                <HeaderComponent isMobile={isMobile} />

                {/* Main Content */}
                <Routes>
                    <Route path="/" element={<AQIChart />} />
                    <Route path="/reports" element={<Reports />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;