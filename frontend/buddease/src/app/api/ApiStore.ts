// ApiStore.ts
import ApiConfig from '@/app/api/ApiConfigService';

import { makeAutoObservable } from 'mobx'; // or any state management library like Redux

export interface ApiState {
  apiConfigs: ApiConfig[];
  area: string; // Add area property to the state
}

export class ApiManagerStore {
  apiState: ApiState = {
    apiConfigs: [],
    area: '', // Initialize area as an empty string
  };

  constructor() {
    makeAutoObservable(this);
  }

  fetchApiConfigsSuccess(apiConfigs: ApiConfig[]) {
    this.apiState.apiConfigs = apiConfigs;
  }

  updateArea(area: string) {
    this.apiState.area = area;
  }

  getArea() {
    return this.apiState.area;
  }

  // This method will be used to update an existing API configuration
  updateApiConfigSuccess(updatedConfig: ApiConfig) {
    // Check if the config already exists based on some unique identifier, e.g., 'id'
    const index = this.apiState.apiConfigs.findIndex(config => config.id === updatedConfig.id);

    if (index !== -1) {
      // If it exists, update the existing configuration
      this.apiState.apiConfigs[index] = updatedConfig;
    } else {
      // If it doesn't exist, add the new configuration to the list
      this.apiState.apiConfigs.push(updatedConfig);
    }
  }

  // Optionally, if you want to update multiple configurations at once:
  updateMultipleApiConfigsSuccess(updatedConfigs: ApiConfig[]) {
    updatedConfigs.forEach(updatedConfig => {
      this.updateApiConfigSuccess(updatedConfig); // Reuse the logic above for individual updates
    });
  }
}

export const useApiManagerStore = () => new ApiManagerStore();
