import axios from 'axios';
import { getBaseUrl, getApiKey } from '../utils/apiUtils';

const zphs01bApiClient = axios.create({
  baseURL: getBaseUrl(),
});

zphs01bApiClient.interceptors.request.use((config) => {
  const apiKey = getApiKey();
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export const getZPHS01BData = async ({
  limit,
  start_time,
  end_time,
}: {
  limit?: number;
  start_time?: string;
  end_time?: string;
}) => {
  let url = '/zphs01b_data?';
  if (limit !== undefined) {
    url += `limit=${limit}`;
  }
  if (start_time) {
    url += `&start_time=${start_time}`;
  }
  if (end_time) {
    url += `&end_time=${end_time}`;
  }

  const response = await zphs01bApiClient.get(url);
  return response.data;
};

export default zphs01bApiClient;
