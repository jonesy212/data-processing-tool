import { DataAnalysis } from "@/app/components/projects/DataAnalysisPhase/DataAnalysis";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DataAnalysisState {
  dataAnalysis: DataAnalysis[];
  error: string | null;
  loading: boolean;
}

const initialState: DataAnalysisState = {
  dataAnalysis: [],
  error: null,
  loading: false,
};

export const useDataAnalysisManagerSlice = createSlice({
  name: 'dataAnalysis',
  initialState,
  reducers: {
    fetchDataAnalysisRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDataAnalysisSuccess: (state, action: PayloadAction<{ dataAnalysis: DataAnalysis[] }>) => {
      state.loading = false;
      state.dataAnalysis = action.payload.dataAnalysis;
    },
    fetchDataAnalysisFailure: (state, action: PayloadAction<{ error: string }>) => {
      state.loading = false;
      state.error = action.payload.error;
    },
  },
});

export const {
  fetchDataAnalysisRequest,
  fetchDataAnalysisSuccess,
  fetchDataAnalysisFailure,
} = useDataAnalysisManagerSlice.actions;

export default useDataAnalysisManagerSlice.reducer;
