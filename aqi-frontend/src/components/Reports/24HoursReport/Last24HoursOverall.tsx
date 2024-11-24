import React, { useState } from 'react';
import { Button, Spin, Typography, message, DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { fetchHourlyData, HourlyData } from './fetchHourlyData';
import ReportTable from './ReportTable';

const { Title } = Typography;

const Last24HoursOverall: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [hourlyAverages, setHourlyAverages] = useState<HourlyData[]>([]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const data = await fetchHourlyData(selectedDate || undefined); // Pass date or use current timestamp
      setHourlyAverages(data);
      message.success('Successfully fetched data.');
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  const exportAllDataToPDF = () => {
    if (hourlyAverages.length === 0) {
      message.error('No data available to export.');
      return;
    }

    try {
      const jsPDF = require('jspdf');
      require('jspdf-autotable');

      const doc = new jsPDF('p', 'mm', 'a4');
      const columns = [
        'Start Time',
        'End Time',
        'Data Points',
        'Wind Direction',
        'Avg Wind Speed (km/h)',
        'Avg Angle (°)',
        'VOC Count',
        'Moving Avg AQI',
      ];
      const rows = hourlyAverages.map((data) => [
        data.startTime,
        data.endTime,
        data.dataPointCount,
        data.windDirectionReadable || 'N/A',
        data.avgWindSpeed.toFixed(2),
        data.avgAngle.toFixed(2),
        data.vocDataCount || 'N/A',
        data.slidingWindowAverages ? data.slidingWindowAverages.join(', ') : 'N/A',
      ]);

      doc.setFontSize(14);
      doc.text('Last 24 Hours Report', 14, 15);
      (doc as any).autoTable({
        head: [columns],
        body: rows,
        startY: 25,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [22, 160, 133] },
        margin: { top: 20 },
        didDrawPage: (data: any) => {
          const pageCount = doc.internal.getNumberOfPages();
          doc.text(`Page ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
        },
      });

      doc.save('Last24HoursReport.pdf');
      message.success('PDF generated successfully.');
    } catch (error) {
      console.error('Error exporting data to PDF:', error);
      message.error('Failed to export data as PDF.');
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
        onClick={generateReport}
        loading={loading}
        style={{ marginBottom: '20px', marginRight: '10px' }}
      >
        Generate Report
      </Button>
      <Button
        type="default"
        onClick={exportAllDataToPDF}
        disabled={hourlyAverages.length === 0}
        style={{ marginBottom: '20px' }}
      >
        Export All Data to PDF
      </Button>
      {loading ? (
        <Spin tip="Loading hourly data..." />
      ) : (
        <ReportTable hourlyAverages={hourlyAverages} />
      )}
    </div>
  );
};

export default Last24HoursOverall;
