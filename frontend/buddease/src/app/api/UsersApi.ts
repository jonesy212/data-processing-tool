import axios from 'axios';

// Modify the function to accept user ID as a parameter
export const getUsersData = async (userId: string) => {
  try {
    // Use the user ID to fetch data for a specific user
    const response = await axios.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error; // Propagate the error to the calling code
  }
};
