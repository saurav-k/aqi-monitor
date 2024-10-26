import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AQIData } from '../types/aqiData';

export const aqiApi = createApi({
  reducerPath: 'aqiApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000' }),
  endpoints: (builder) => ({
    getAQIData: builder.query<AQIData[], void>({
      query: () => '/aqi_data',
    }),
  }),
});

export const { useGetAQIDataQuery } = aqiApi;
