import React, { useState } from 'react';
import { Tabs } from 'antd';
import WindReport from './WindReport/WindReport'; // Import the WindReport component
import Last24HoursOverall from './24HoursReport/Last24HoursOverall'; // Import the Last24HoursOverall component

const { TabPane } = Tabs;

const ReportsComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('wind');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Tabs defaultActiveKey="wind" onChange={handleTabChange} centered>
        {/* Wind Report Tab */}
        <TabPane tab="Wind Report" key="wind">
          {activeTab === 'wind' && <WindReport />}
        </TabPane>

        {/* Last 24 Hours Overall Average Tab */}
        <TabPane tab="Last 24 Hours Report" key="last24hours">
          {activeTab === 'last24hours' && <Last24HoursOverall />}
        </TabPane>

        {/* Placeholder for Additional Reports */}
        <TabPane tab="Other Report" key="other">
          <p>Other report functionality will go here.</p>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportsComponent;
