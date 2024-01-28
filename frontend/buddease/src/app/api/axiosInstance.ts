import axios from 'axios';


const API_BASE_URL = 'your_actual_base_url'; 

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export default axiosInstance;
