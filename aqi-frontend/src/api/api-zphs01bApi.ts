// src/api/zphs01bApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ZPHS01BData } from '../types/aqiData';
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

export const zphs01bApi = createApi({
  reducerPath: 'zphs01bApi',
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
    getZPHS01BData: builder.query<ZPHS01BData[], { limit?: number; start_time?: string; end_time?: string }>({
      query: ({ limit = 5, start_time, end_time }) => {
        let url = `/zphs01b_data?limit=${limit}`;
        if (start_time) url += `&start_time=${start_time}`;
        if (end_time) url += `&end_time=${end_time}`;
        return url;
      },
    }),
  }),
});

export const { useGetZPHS01BDataQuery } = zphs01bApi;
