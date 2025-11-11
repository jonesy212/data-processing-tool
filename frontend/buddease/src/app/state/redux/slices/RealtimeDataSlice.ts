import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { RealtimeData } from '@/app/hooks/commHooks/processSnapshotStore';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';


interface RealtimeDataEntity extends BaseDataEntity {
  id: string;
  value: string | number;
  timestamp?: Date;
  type?: string;
}

type RealtimeDataK = RealtimeDataEntity;
type RealtimeDataMeta = DefaultMeta<RealtimeDataEntity, RealtimeDataK>;
type RealtimeDataExcludedFields = DefaultExcludedFields<RealtimeDataEntity>;
type AppRealtimeData = RealtimeData<
  RealtimeDataEntity,
  RealtimeDataK,
  RealtimeDataMeta,
  RealtimeDataExcludedFields
>;


// Define interface for the state
export interface RealtimeDataState {
  realtimeDataList: AppRealtimeData[];
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
    fetchltimeData: (state, action: PayloadAction<AppRealtimeData>) => {
      state.realtimeDataList = [action.payload];
      console.log(state.realtimeDataList);
    },
    addRealtimeData: (state, action: PayloadAction<AppRealtimeData>) => {
      state.realtimeDataList.push(action.payload);
    },
    updateRealtimeData: (state, action: PayloadAction<AppRealtimeData>) => {
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
