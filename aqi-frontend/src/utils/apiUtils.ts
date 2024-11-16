// src/utils/apiUtils.ts

export const getBaseUrl = (): string => {
    return 'https://www.tridasa.online/api'
  };
  

// Function to retrieve the API key (use secure storage or environment variables)
export const getApiKey = () => {
  return process.env.REACT_APP_API_KEY || 'your-secure-api-key';
};