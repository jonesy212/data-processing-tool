import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RandomWalkState {
  // Define the initial state structure here
  randomWalks: number[];
  loading: boolean;
  error: string | null;
}

const initialState: RandomWalkState = {
  randomWalks: [],
  loading: false,
  error: null,
};

export const useRandomWalkManagerSlice = createSlice({
  name: "randomWalkManager",
  initialState,
  reducers: {
    // Define reducers to handle various actions
    fetchRandomWalkRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchRandomWalkSuccess(state, action: PayloadAction<{ randomWalk: number[] }>) {
      state.randomWalks = action.payload.randomWalk;
      state.loading = false;
      state.error = null;
    },
    fetchRandomWalkFailure(state, action: PayloadAction<{ error: string }>) {
      state.loading = false;
      state.error = action.payload.error;
    },
    // Add more reducers as needed for other actions
  },
});

export const { fetchRandomWalkRequest, fetchRandomWalkSuccess, fetchRandomWalkFailure } = useRandomWalkManagerSlice.actions;

export default useRandomWalkManagerSlice.reducer;
export type { RandomWalkState };
