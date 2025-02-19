// useApiManager.ts
import { ApiConfig } from '@/app/configs/ConfigurationService';
import { useEffect } from 'react';
import { useApiManagerStore } from '../../state/stores/ApiStore';

const useApiManager = () => {
  const apiManagerStore = useApiManagerStore();

  useEffect(() => {
    apiManagerStore.fetchApiConfigsRequest();

    const fetchApiConfigs = async () => {
      try {
        const response = await fetch('/api/configs');
        const apiConfigsData = await response.json();
        apiManagerStore.fetchApiConfigsSuccess({ apiConfigs: apiConfigsData.apiConfig });
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
        const updatedConfig: ApiConfig = await response.json();
        apiManagerStore.updateApiConfigSuccess({ apiConfig: updatedConfig }); // Corrected payload structure
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
