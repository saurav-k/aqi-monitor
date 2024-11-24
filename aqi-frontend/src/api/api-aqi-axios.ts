import axios from 'axios';
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

const aqiApiClient = axios.create({
  baseURL: getBaseUrl(),
});

aqiApiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export const getAQIData = async ({
  limit,
  start_time,
  end_time,
}: {
  limit?: number;
  start_time?: string;
  end_time?: string;
}) => {
  let url = '/aqi_data?';
  if (limit !== undefined) {
    url += `limit=${limit}`;
  }
  if (start_time) {
    url += `&start_time=${start_time}`;
  }
  if (end_time) {
    url += `&end_time=${end_time}`;
  }

  const response = await aqiApiClient.get(url);
  return response.data;
};

export default aqiApiClient;
