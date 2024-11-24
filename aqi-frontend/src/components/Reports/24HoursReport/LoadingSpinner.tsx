import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner: React.FC = () => (
  <Spin tip="Loading hourly data..." style={{ display: 'block', textAlign: 'center', marginTop: '20px' }} />
);

export default LoadingSpinner;
