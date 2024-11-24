import React, { useState } from 'react';
import { Button, Spin, Typography, message, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { fetchHourlyData,  HourlyData } from './fetchHourlyData';
import ReportTable from './ReportTable';

const { Title } = Typography;

const Last24HoursOverall: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<HourlyData[]>([]);

  const generateReportForLast24Hours = async () => {
    setLoading(true);
    try {
      const data = await fetchHourlyData(selectedDate || undefined);
      setHourlyAverages(data);
      message.success('Successfully fetched data for the last 24 hours.');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data for the last 24 hours.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const reportElement = document.getElementById('reportTable');
      if (!reportElement) {
        message.error('Report table not found.');
        return;
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
      });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Last24HoursReport.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error('Failed to export the report as PDF.');
    }
  };

  return (
    <div style={{ padding: '20px', overflowY: 'auto', maxHeight: '100vh' }}>
      <Title level={3} style={{ textAlign: 'center' }}>
        Last 24 Hours Report
      </Title>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <DatePicker
          onChange={(date) => setSelectedDate(date)}
          placeholder="Select a date"
          allowClear
        />
      </div>
      <Button
        type="primary"
        onClick={generateReportForLast24Hours}
        loading={loading}
        style={{ marginBottom: '20px', marginRight: '10px' }}
      >
        Generate Report
      </Button>
      <Button
        type="default"
        onClick={exportToPDF}
        disabled={hourlyAverages.length === 0}
        style={{ marginBottom: '20px' }}
      >
        Export to PDF
      </Button>
      {loading ? (
        <Spin tip="Loading hourly data..." />
      ) : (
        <div id="reportTable">
          <ReportTable hourlyAverages={hourlyAverages} />
        </div>
      )}
    </div>
  );
};

export default Last24HoursOverall;
