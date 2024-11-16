import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AQIData } from '../types/aqiData';
import { getBaseUrl, getApiKey  } from '../utils/apiUtils';

export const aqiApi = createApi({
  reducerPath: 'aqiApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: getBaseUrl(),
    prepareHeaders: (headers) => {
      // Add the API key to the request header
      const apiKey = getApiKey();
      if (apiKey) {
        headers.set('X-API-Key', apiKey);
      }
      return headers;
    }, 
  }),
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
