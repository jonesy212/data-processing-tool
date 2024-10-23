import axiosInstance from "@/app/api/axiosInstance";

// Assume you have a variable containing the CSRF token (you might get it from a cookie or another source)
export const csrfToken = 'your_csrf_token_here';


axiosInstance.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = csrfToken;
  return config;
});

export default axiosInstance;
