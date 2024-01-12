import axios from 'axios';

export const getConfigsData = async () => {
  try {
    const response = await axios.get('/api/configs');
    return response.data;
  } catch (error) {
    console.error('Error fetching configs data:', error);
  }
};
