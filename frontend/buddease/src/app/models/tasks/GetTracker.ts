// Assuming you use a library like axios for making HTTP requests
import axios from 'axios';

export const getTrackers = async () => {
    try {
        const response = await axios.get('/get_trackers');
        const { team_count, user_count } = response.data;
        // Update your frontend state with the received data
        
        return response.data;
    } catch (error) {
        console.error('Error fetching trackers:', error);
    }
};
