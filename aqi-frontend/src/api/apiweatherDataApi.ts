// src/api/apiweatherDataApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { WeatherData } from '../types/aqiData'; // Import your WeatherData type
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

export const weatherDataApi = createApi({
  reducerPath: 'weatherDataApi',
  baseQuery: fetchBaseQuery({
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      const apiKey = getApiKey();
      if (apiKey) {
        headers.set('X-API-Key', apiKey);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getWeatherData: builder.query<WeatherData[], { limit?: number; start_time?: string; end_time?: string }>({
      query: ({ limit = 5, start_time, end_time }) => {
        let url = `/weather_data?limit=${limit}`;
        if (start_time) url += `&start_time=${start_time}`;
        if (end_time) url += `&end_time=${end_time}`;
        return url;
      },
    }),
  }),
});

export const { useGetWeatherDataQuery } = weatherDataApi;
