import { configureStore } from '@reduxjs/toolkit';
import { aqiApi } from '../api/api';
import { trackingApi } from '../api/api-tracking';

const store = configureStore({
  reducer: {
    [aqiApi.reducerPath]: aqiApi.reducer,
    [trackingApi.reducerPath]: trackingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(aqiApi.middleware)
      .concat(trackingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
