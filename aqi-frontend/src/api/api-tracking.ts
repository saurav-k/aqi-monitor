import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const trackingApi = createApi({
  reducerPath: 'aqiApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://98.130.74.124:8082' }),
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
