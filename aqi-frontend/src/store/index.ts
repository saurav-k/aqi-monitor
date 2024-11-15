// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { aqiApi } from '../api/api';
import { trackingApi } from '../api/api-tracking';
import { zphs01bApi } from '../api/api-zphs01bApi'; // Existing API
import { weatherDataApi } from '../api/apiweatherDataApi'; // Import the new WeatherData API

const store = configureStore({
  reducer: {
    [aqiApi.reducerPath]: aqiApi.reducer,
    [trackingApi.reducerPath]: trackingApi.reducer,
    [zphs01bApi.reducerPath]: zphs01bApi.reducer, // Existing API reducer
    [weatherDataApi.reducerPath]: weatherDataApi.reducer, // Add the new WeatherData API reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      aqiApi.middleware,
      trackingApi.middleware,
      zphs01bApi.middleware, // Existing API middleware
      weatherDataApi.middleware // Add the new WeatherData API middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
