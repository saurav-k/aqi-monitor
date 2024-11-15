import React from 'react';
import { useGetWeatherDataQuery } from '../api/apiweatherDataApi';
import { Chart, calculateWindRose } from '@eunchurn/react-windrose-chart';

const WindRoseComponent = () => {
  // Step 1: Fetch weather data using RTK Query hook
  const { data: weatherData, error, isLoading } = useGetWeatherDataQuery({ limit: 100 });

  // Handle loading and error states
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading weather data</div>;

  // Step 2: Extract directions and speeds from the fetched data
  const directions = weatherData?.map((d) => d.wind_direction);
  const speeds = weatherData?.map((d) => d.wind_speed);

  if (!directions || !speeds) return <div>No data available for Wind Rose</div>;

  // Step 3: Prepare wind rose data using the calculateWindRose function
  const windRoseData = calculateWindRose({
    direction: directions,
    speed: speeds,
  });

  // Step 4: Define chart settings
  const columns = ["angle", "0-1", "1-2", "2-3", "3-4", "4-5", "5-6", "6-7", "7+"];

  // Step 5: Render Wind Rose Chart using transformed data
  return (
    <div>
      <h3>Wind Rose Chart</h3>
      <Chart
        chartData={windRoseData}
        columns={columns}
        width={600}
        height={600}
        responsive={false}
        legendGap={10}
      />
    </div>
  );
};

export default WindRoseComponent;
