import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RealtimeData } from '../../../models/realtime/RealtimeData';

// Define interface for the state
export interface RealtimeDataState {
  realtimeDataList: RealtimeData[];
}

// Define initial state
export const initialState: RealtimeDataState = {
  realtimeDataList: [],
};

// Create slice
export const useRealtimeDataSlice = createSlice({
  name: 'realtimeData',
  initialState,
  reducers: {
    fetchltimeData: (state, action: PayloadAction<RealtimeData>) => {
      state.realtimeDataList = [action.payload];
      console.log(state.realtimeDataList);
    },
    addRealtimeData: (state, action: PayloadAction<RealtimeData>) => {
      state.realtimeDataList.push(action.payload);
    },
    updateRealtimeData: (state, action: PayloadAction<RealtimeData>) => {
      const index = state.realtimeDataList.findIndex(
        (data) => data.id === action.payload.id.toString()
      );
      if (index !== -1) {
        state.realtimeDataList[index] = action.payload;
      }
    },
    removeRealtimeData: (state, action: PayloadAction<number>) => {
      state.realtimeDataList = state.realtimeDataList.filter(
        (data) => data.id.toString() !== action.payload.toString()
      );
    },
  },
});

// Export actions
export const {
  addRealtimeData,
  updateRealtimeData,
  removeRealtimeData
} = useRealtimeDataSlice.actions;

// Export selector for accessing the realtime data list from the state
export const selectRealtimeDataList = (state: { realtimeData: RealtimeDataState }) => state.realtimeData.realtimeDataList;

// Export reducer for the realtime data slice
export default useRealtimeDataSlice.reducer;
