import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AQIData } from '../types/aqiData';

export const aqiApi = createApi({
  reducerPath: 'aqiApi',
  // baseQuery: fetchBaseQuery({ baseUrl: process.env.REACT_APP_BASE_URL }),
  baseQuery: fetchBaseQuery({ baseUrl: 'http://98.130.74.124:8082' }),
  endpoints: (builder) => ({
    getAQIData: builder.query<AQIData[], { limit?: number; start_time?: string; end_time?: string }>({
      query: ({ limit = 100, start_time, end_time }) => {
        let url = `/aqi_data?limit=${limit}`;
        if (start_time) url += `&start_time=${start_time}`;
        if (end_time) url += `&end_time=${end_time}`;
        return url;
      },
    }),
  }),
});

export const { useGetAQIDataQuery } = aqiApi;
