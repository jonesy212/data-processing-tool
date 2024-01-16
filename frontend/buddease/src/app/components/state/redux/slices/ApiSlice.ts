// ApiSlice.ts
import { ApiConfig } from '@/app/configs/ConfigurationService';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ApiManagerState {
  apiConfigs: ApiConfig[];
  apiConfigName: string;
  apiConfigUrl: string;
  apiConfigTimeout: number;
}

const initialState: ApiManagerState = {
  apiConfigs: [],
  apiConfigName: '',
  apiConfigUrl: '',
  apiConfigTimeout: 0,
};

export const apiManagerSlice = createSlice({
  name: 'apiManager',
  initialState,
  reducers: {
    updateApiConfigName: (state, action: PayloadAction<string>) => {
      state.apiConfigName = action.payload;
    },

    updateApiConfigUrl: (state, action: PayloadAction<string>) => {
      state.apiConfigUrl = action.payload;
    },

    updateApiConfigTimeout: (state, action: PayloadAction<number>) => {
      state.apiConfigTimeout = action.payload;
    },

    addApiConfig: (state, action: PayloadAction<ApiConfig>) => {
      state.apiConfigs.push(action.payload);
      state.apiConfigName = '';
      state.apiConfigUrl = '';
      state.apiConfigTimeout = 0;
    },

    removeApiConfig: (state, action: PayloadAction<number>) => {
      state.apiConfigs = state.apiConfigs.filter(config => config.id !== action.payload);
    },

    // Add more actions as needed
  },
});

// Export actions
export const {
  updateApiConfigName,
  updateApiConfigUrl,
  updateApiConfigTimeout,
  addApiConfig,
  removeApiConfig,
} = apiManagerSlice.actions;

// Export selector for accessing the API configurations from the state
export const selectApiConfigs = (state: { apiManager: ApiManagerState }) => state.apiManager.apiConfigs;

// Export reducer for the API manager slice
export default apiManagerSlice.reducer;
