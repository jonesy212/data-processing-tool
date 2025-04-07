// useApiManager.ts
import { ApiConfig } from '@/app/configs/ConfigurationService';
import { useEffect } from 'react';
import { useApiManagerStore } from '@/app/api/ApiStore';

const useApiManager = () => {
  const apiManagerStore = useApiManagerStore();

  useEffect(() => {
    const fetchApiConfigs = async () => {
      try {
        const response = await fetch('/api/configs');
        const apiConfigsData = await response.json();
        apiManagerStore.fetchApiConfigsSuccess(apiConfigsData.apiConfig);
      } catch (error) {
        console.error('Error fetching API configurations:', error);
      }
    };

    fetchApiConfigs();
  }, []);

  const updateApiConfig = async (id: number, newConfig: ApiConfig) => {
    try {
      const response = await fetch(`/api/configs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newConfig),
      });
  
      if (response.ok) {
        // Parse the response to get the updated API config
        const updatedConfig: ApiConfig = await response.json();
  
        // Correctly pass the updated configuration to the store
        apiManagerStore.updateApiConfigSuccess(updatedConfig); // Use 'updatedConfig' instead of 'apiConfigsData.updatedConfig'
      } else {
        console.error('Failed to update API configuration:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating API configuration:', error);
    }
  };

  // Add more methods as needed

  return {
    apiManagerStore, updateApiConfig
  };
};

export default useApiManager;
