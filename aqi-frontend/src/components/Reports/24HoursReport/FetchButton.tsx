import React from 'react';
import { Button } from 'antd';

interface FetchButtonProps {
  onClick: () => void;
  loading: boolean;
}

const FetchButton: React.FC<FetchButtonProps> = ({ onClick, loading }) => (
  <Button
    type="primary"
    onClick={onClick}
    loading={loading}
    style={{ marginBottom: '20px' }}
  >
    Fetch Data
  </Button>
);

export default FetchButton;
