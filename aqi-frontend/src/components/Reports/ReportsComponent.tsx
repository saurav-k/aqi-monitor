import React from "react";

interface WeatherReport {
  start_time: string | null;
  end_time: string | null;
  wind_direction_readable: string;
  data_point_count: number;
  percentage: number;
  avg_wind_speed_kmh: number;
  avg_angle: number;
}

const ReportsComponent: React.FC = () => {
  const dummyReports: WeatherReport[] = [
    {
      start_time: "2024-11-24T07:00:00",
      end_time: "2024-11-24T08:00:00",
      wind_direction_readable: "Wind Coming from NE",
      data_point_count: 9,
      percentage: 16.98,
      avg_wind_speed_kmh: 0.78,
      avg_angle: 41.83,
    },
    {
      start_time: "2024-11-24T07:00:00",
      end_time: "2024-11-24T08:00:00",
      wind_direction_readable: "Wind Coming from NNE",
      data_point_count: 7,
      percentage: 13.21,
      avg_wind_speed_kmh: 1.16,
      avg_angle: 21.20,
    },
    {
      start_time: "2024-11-24T07:00:00",
      end_time: "2024-11-24T08:00:00",
      wind_direction_readable: "Wind Coming from SE",
      data_point_count: 6,
      percentage: 11.32,
      avg_wind_speed_kmh: 0.56,
      avg_angle: 117.50,
    },
    {
      start_time: null,
      end_time: null,
      wind_direction_readable: "Overall Average",
      data_point_count: 53,
      percentage: 100.0,
      avg_wind_speed_kmh: 0.72,
      avg_angle: 34.08,
    },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Weather Reports</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Start Time</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>End Time</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Wind Direction</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Data Points</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Percentage (%)</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Avg Wind Speed (km/h)</th>
            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Avg Angle</th>
          </tr>
        </thead>
        <tbody>
          {dummyReports.map((report, index) => (
            <tr key={index}>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.start_time || "N/A"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.end_time || "N/A"}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.wind_direction_readable}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.data_point_count}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.percentage.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.avg_wind_speed_kmh.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                {report.avg_angle.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReportsComponent;
