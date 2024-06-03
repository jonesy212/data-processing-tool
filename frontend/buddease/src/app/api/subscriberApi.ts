// subscriberApi.ts
import { Data } from '../components/models/data/Data';
import { Subscriber } from '../components/users/Subscriber';
import axiosInstance from './axiosInstance';

export const getSubscribersAPI = async (): Promise<Subscriber<Data>[]> => {
  try {
    const response = await axiosInstance.get('/subscribers');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    throw error;
  }
};

const fetchSubscribers = async () => {
  try {
    const subscribers = await getSubscribers();
    console.log('Subscribers:', subscribers);
  } catch (error) {
    console.error('Failed to fetch subscribers:', error);
  }
};

fetchSubscribers();
