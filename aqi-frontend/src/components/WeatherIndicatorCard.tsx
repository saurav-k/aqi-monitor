import React, { useState, useEffect } from 'react';
import { Button, Modal } from 'antd';
import { Rose } from '@ant-design/plots';
import { useGetWeatherDataQuery } from '../api/apiweatherDataApi'; // Replace with your actual path

// Helper Functions
const classifyDirection = (direction: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(direction / 22.5) % 16;
  return directions[index];
};

const classifySpeedCategory = (speed: number): string => {
  if (speed < 0.5) return '< 0.5 m/s';
  if (speed >= 0.5 && speed < 2) return '0.5-2 m/s';
  if (speed >= 2 && speed < 4) return '2-4 m/s';
  if (speed >= 4 && speed < 6) return '4-6 m/s';
  if (speed >= 6 && speed < 8) return '6-8 m/s';
  if (speed >= 8 && speed < 10) return '8-10 m/s';
  return '> 10 m/s';
};

const convertToWindRoseData = (aqiData: { wind_direction: number; wind_speed: number; timestamp: string }[]): { direction: string; speedCategory: string; value: number }[] => {
  const lastFiveMinutes = new Date(Date.now() - 5 * 60 * 1000);
  return aqiData
    .filter((data) => new Date(data.timestamp) > lastFiveMinutes)
    .map((data) => ({
      direction: classifyDirection(data.wind_direction),
      speedCategory: classifySpeedCategory(data.wind_speed),
      value: 1,
    }));
};

// Main Component
function WindRoseComponent() {
  const { data: weatherData, error, isLoading } = useGetWeatherDataQuery({ limit: 100 });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading weather data</div>;

  const processedData = convertToWindRoseData(weatherData || []);

  const config = {
    data: processedData,
    xField: 'direction',
    yField: 'value',
    seriesField: 'speedCategory',
    isStack: true,
    radius: 0.8,
    color: ({ speedCategory }: { speedCategory: string }) => {
      switch (speedCategory) {
        case '< 0.5 m/s':
          return '#E3F4BF';
        case '0.5-2 m/s':
          return '#BEF7C8';
        case '2-4 m/s':
          return '#86E6C8';
        case '4-6 m/s':
          return '#36CFC9';
        case '6-8 m/s':
          return '#209BDD';
        case '8-10 m/s':
          return '#1581E6';
        case '> 10 m/s':
          return '#0860BF';
        default:
          return '#CCCCCC';
      }
    },
    label: {
      offset: -15,
      style: {
        fill: '#ffffff',
        opacity: 0.6,
        fontSize: 10,
      },
    },
  };

  return (
    <div id="chart-demo">
      <Button type="primary" onClick={showModal}>
        Show Wind Direction Chart
      </Button>
      <Modal title="Wind Rose Chart" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel} width={800}>
        <Rose {...config} />
      </Modal>
    </div>
  );
}

export default WindRoseComponent;
