// HistorySlice.ts
// Assuming your historySlice looks something like this:
import { createSlice } from '@reduxjs/toolkit';
import { HistoryItem } from '../sagas/UndoRedoSaga';

interface HistoryState {
  history: HistoryItem[]; // Assuming HistoryItem is the type of items in your history
}

const initialState: HistoryState = {
  history: [],
};

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    // Define reducers for modifying history if needed
  },
});

export const { /* Reducers */ } = historySlice.actions;
export default historySlice.reducer;
