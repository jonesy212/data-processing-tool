// Client-side API calls from React components
import { axiosInstance } from '@/app/api/axiosConfig';

export const csrfToken = 'your_csrf_token_here';

axiosInstance.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = csrfToken;
  return config;
});

export default axiosInstance;