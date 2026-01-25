// serverApi.ts
src/app/lib/server-api.ts
server-api.ts - INTERNAL server-to-server API

import axios from 'axios';

const serverApi = axios.create({
  baseURL: process.env.INTERNAL_API_URL || '/api/',
});

Server-specific configuration
serverApi.interceptors.request.use((config) => {
  config.headers['x-server-request'] = 'true';
  return config;
});

export default serverApi;