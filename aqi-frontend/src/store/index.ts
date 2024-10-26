import { configureStore } from '@reduxjs/toolkit';
import { aqiApi } from '../api/api';

const store = configureStore({
  reducer: {
    [aqiApi.reducerPath]: aqiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aqiApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
