import htmlDocx from 'html-docx-js/dist/html-docx';
import { saveAs } from 'file-saver';
import { message } from 'antd';

export interface WeatherReport {
  start_time: string | null;
  end_time: string | null;
  wind_direction_readable: string;
  data_point_count: number;
  percentage: number;
  avg_wind_speed_kmh: number;
  avg_angle: number;
}

export const generateHTMLDoc = (consolidatedData: WeatherReport[], date: string) => {
  const groupedByHour = consolidatedData.reduce((acc: any, item: any) => {
    if (!acc[item.hour]) acc[item.hour] = [];
    acc[item.hour].push(item);
    return acc;
  }, {});

  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1;
          }
          h1 {
            text-align: center;
            color: #333;
            font-size: 16px; /* Smaller header size for download */
          }
          h2 {
            color: #4CAF50;
            font-size: 14px;
            margin-top: 20px; /* Space between hour sections */
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 2px 0; /* Reduced margin */
          }
          th, td {
            border: 1px solid #ddd;
            padding: 4px; /* Compact padding */
            text-align: center;
          }
          th {
            background-color: #4CAF50; /* Green header */
            color: white;
            font-size: 8px; /* Compact font size for header */
          }
          td {
            font-size: 8px; /* Smaller font for data rows */
            color: #555;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9; /* Alternating rows */
          }
          tr:hover {
            background-color: #f1f1f1; /* Highlight on hover */
          }
        </style>
      </head>
      <body>
        <h1>Weather Report for ${date}</h1>
        ${Object.keys(groupedByHour)
          .map(
            (hour) => `
              <h2>Hour: ${hour}</h2>
              <table>
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Wind Direction</th>
                    <th>Data Points</th>
                    <th>Percentage (%)</th>
                    <th>Avg Wind Speed (km/h)</th>
                    <th>Avg Angle</th>
                  </tr>
                </thead>
                <tbody>
                  ${groupedByHour[hour]
                    .map(
                      (item: WeatherReport) => `
                        <tr>
                          <td>${item.start_time || 'N/A'}</td>
                          <td>${item.end_time || 'N/A'}</td>
                          <td>${item.wind_direction_readable}</td>
                          <td>${item.data_point_count}</td>
                          <td>${item.percentage.toFixed(2)}</td>
                          <td>${item.avg_wind_speed_kmh.toFixed(2)}</td>
                          <td>${item.avg_angle.toFixed(2)}°</td>
                        </tr>
                      `
                    )
                    .join('')}
                </tbody>
              </table>
              <div style="margin-bottom: 30px;"></div> <!-- Add space after each hour -->
            `
          )
          .join('')}
      </body>
    </html>
  `;

  const blob = htmlDocx.asBlob(htmlContent);
  saveAs(blob, `Weather_Report_${date}.docx`);
  message.success('Report downloaded successfully!');
};
