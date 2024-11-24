import React from 'react';
import { Button } from 'antd';
import { generateHTMLDoc, WeatherReport } from './reportUtils';

interface DownloadButtonProps {
  data: WeatherReport[];
  startTime: string;
  endTime: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data, startTime, endTime }) => {
  const handleDownload = () => {
    if (!data || data.length === 0) {
      alert('No data available for download.');
      return;
    }

    const formattedData = data.map((item) => ({
      ...item,
      hour: `${startTime} - ${endTime}`, // Add start and end time for context
    }));

    generateHTMLDoc(formattedData, `${startTime} to ${endTime}`);
  };

  return (
    <Button type="primary" onClick={handleDownload}>
      Download Data
    </Button>
  );
};

export default DownloadButton;
