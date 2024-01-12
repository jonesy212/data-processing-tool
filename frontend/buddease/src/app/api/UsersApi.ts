import axios from 'axios';

export const getUsersData = async () => {
  try {
    const response = await axios.get('/api/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users data:', error);
  }
};
