// featureSlice.ts
import { createSlice } from "@reduxjs/toolkit";

const featureSlice = createSlice({
  name: "feature",
  initialState: {
    featureData: null,
  },
  reducers: {
    updateFeatureData(state, action) {
      state.featureData = action.payload;
    },
  },
});

export const { updateFeatureData } = featureSlice.actions;
export default featureSlice.reducer;