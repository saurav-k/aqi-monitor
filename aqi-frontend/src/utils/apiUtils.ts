// src/utils/apiUtils.ts

export const getBaseUrl = (): string => {
    return window.location.origin === 'https://www.tridasa.online'
      ? 'https://www.tridasa.online/api'
      : 'http://98.130.74.124:8082';
  };
  