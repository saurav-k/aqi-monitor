// src/api/apiClient.ts
import axios from 'axios';
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

const apiClient = axios.create({
  baseURL: getBaseUrl(), // Dynamic base URL based on environment
  timeout: 10000, // Optional: set timeout
});

apiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export default apiClient;
