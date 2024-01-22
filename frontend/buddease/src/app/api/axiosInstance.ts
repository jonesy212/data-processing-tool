import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'your_base_api_url', // Replace with your actual API base URL
});

export default axiosInstance;
