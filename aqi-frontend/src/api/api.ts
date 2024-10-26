import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { AQIData } from '../types/aqiData';

export const aqiApi = createApi({
  reducerPath: 'aqiApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://127.0.0.1:8082' }),
  endpoints: (builder) => ({
    getAQIData: builder.query<AQIData[], number | void>({
      // Accept `limit` as an argument and add it as a query parameter
      query: (limit = 100) => `/aqi_data?limit=${limit}`,
    }),
  }),
});

export const { useGetAQIDataQuery } = aqiApi;
export default aqiApi;
