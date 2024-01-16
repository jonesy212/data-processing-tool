import axios from 'axios';
import configurationService from '../configs/ConfigurationService';

export const getConfigsData = async () => {
  try {
    const systemConfigs = await configurationService.getSystemConfigs();
    const userConfigs = await configurationService.getUserConfigs();

    // Make API requests using the obtained configurations
    const systemApiResponse = await axios.get(systemConfigs.apiUrl);
    const userApiResponse = await axios.get(userConfigs.apiUrl);

    // Process the API responses as needed

    return {
      systemApiData: systemApiResponse.data,
      userApiData: userApiResponse.data,
    };
  } catch (error) {
    console.error('Error fetching configs data:', error);
  }
};
