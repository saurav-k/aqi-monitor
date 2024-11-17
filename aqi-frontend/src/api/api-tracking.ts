import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

export const trackingApi = createApi({
  reducerPath: 'aqiTracking',
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
    getAQIData: builder.query({
      query: ({ limit = 100, start_time, end_time }) => {
        let url = `/aqi_data?limit=${limit}`;
        if (start_time) url += `&start_time=${start_time}`;
        if (end_time) url += `&end_time=${end_time}`;
        return url;
      },
    }),
    trackEvent: builder.mutation({
      query: (eventType) => ({
        url: '/track_event',
        method: 'POST',
        body: { event_type: eventType },
      }),
    }),
  }),
});

export const { useTrackEventMutation } = trackingApi;
