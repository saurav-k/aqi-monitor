'use client';

import React from 'react';
import { Chart, calculateWindRose, ChartData } from '@eunchurn/react-windrose';
import { ApiData } from './_types';

interface WindRoseChartProps {
  latitude: number;
  longitude: number;
}

export default function WindRoseChart({
  latitude,
  longitude,
}: WindRoseChartProps): JSX.Element {
  const [chartData, setChartData] = React.useState<ChartData[]>([
    {
      angle: 'N',
      '0-1': 0,
      '1-2': 0,
      '2-3': 0,
      '3-4': 0,
      '4-5': 0,
      '5-6': 0,
      '6-7': 0,
      '7+': 0,
      total: 0,
    },
  ]);

  React.useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m`
    )
      .then((res) => res.json() as Promise<ApiData>)
      .then((data) => {
        const {
          hourly: { wind_direction_10m, wind_speed_10m },
        } = data;
        setChartData(
          calculateWindRose({
            direction: wind_direction_10m,
            speed: wind_speed_10m.map((speed) => speed / 3.6), // km/h => m/s
          })
        );
      });
  }, [latitude, longitude]);

  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute min-w-[614px] min-h-[614px]">
        <Chart chartData={chartData} />
      </div>
      <div className="absolute z-50 flex items-center justify-center w-64 h-64">
        <span className="opacity-90 w-[120px] h-[120px] absolute mix-blend-normal will-change-[filter] rounded-[100%] blur-[32px] bg-glow-conic" />
      </div>
    </div>
  );
}
