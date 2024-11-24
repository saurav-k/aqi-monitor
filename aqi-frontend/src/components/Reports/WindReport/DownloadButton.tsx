import React from 'react';
import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface DownloadButtonProps {
  data: any[]; // Replace `any` with a more specific type if available
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ data }) => {
  const handleDownload = () => {
    if (!data) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Wind Report');
    XLSX.writeFile(workbook, 'Wind_Report.xlsx');
  };

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      onClick={handleDownload}
    >
      Download Report
    </Button>
  );
};

export default DownloadButton;
