// src/utils/apiUtils.ts

export const getBaseUrl = (): string => {
    return window.location.origin === 'https://www.tridasa.online'
      ? 'https://www.tridasa.online/api'
      : 'http://18.60.62.78:8082';
  };
  

// Function to retrieve the API key (use secure storage or environment variables)
export const getApiKey = () => {
  return process.env.REACT_APP_API_KEY || 'your-secure-api-key';
};