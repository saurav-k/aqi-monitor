import React, { useState } from 'react';
import { Tabs } from 'antd';
import WindReport from './WindReport'; // Import the WindReport component

const { TabPane } = Tabs;

const ReportsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('wind');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Reports Dashboard</h2>
      <Tabs defaultActiveKey="wind" onChange={handleTabChange} centered>
        <TabPane tab="Wind Report" key="wind">
          {activeTab === 'wind' && <WindReport />}
        </TabPane>
        {/* Additional tabs for other report types can be added here */}
        <TabPane tab="Other Report" key="other">
          <p>Other report functionality will go here.</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportsComponent;
