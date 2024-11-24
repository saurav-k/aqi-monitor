import { AQIData } from '../../types/aqiData';

export const exportToCSV = (data: AQIData[], filename = 'chart_data.csv') => {
    const csvContent = [
        ['Timestamp', 'PM2.5 AQI', 'PM10 AQI', 'PM2.5 # µg/m³', 'PM10 # µg/m³', 'Average  AQI'],
        ...data.map((item) => [
            item.timestamp,
            item.aqi_pm25,
            item.aqi_pm10,
            item.pm25,
            item.pm10,
            (item.aqi_pm25 + item.aqi_pm10) / 2
        ])
    ]
        .map((e) => e.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
