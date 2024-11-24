import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { WeatherReport } from '../types/weatherData'; // Define WeatherReport type in your project
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
    getWeatherDataAnalysis: builder.query<
      WeatherReport[],
      { start_time?: string; end_time?: string }
    >({
      query: ({ start_time, end_time }) => {
        let url = `/weather_data_analysis?`;
        if (start_time) url += `start_time=${start_time}`;
        if (end_time) url += `&end_time=${end_time}`;
        return url;
      },
    }),
  }),
});

export const { useGetWeatherDataAnalysisQuery } = weatherDataApi;
