import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LogState {
  logs: string[];
  
}

const initialState: LogState = {
  logs: [],
};

const logSlice = createSlice({
  name: 'log',
  initialState,
  reducers: {
    addLog(state, action: PayloadAction<string>) {
      state.logs.push(action.payload);
    },
    addAnalysisLog(
      state,
      action: PayloadAction<{ type: string; message: string; timestamp: number }>
    ) { 
      const { type, message, timestamp } = action.payload;
      state.logs.push(`Type: ${type}, Message: ${message}, Timestamp: ${timestamp}`);
    },
    
    clearLogs(state) {
      state.logs = [];
    },
  },
});

export const { addLog, clearLogs } = logSlice.actions;
export default logSlice.reducer;
