// SidebarSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isChatSidebarOpen: boolean;
  isBlogSidebarOpen: boolean; // Example: Add state for the blog sidebar
  // Add more sidebar states as needed
}

const initialState: SidebarState = {
  isChatSidebarOpen: false,
  isBlogSidebarOpen: false, // Example: Initialize state for the blog sidebar
  // Initialize other sidebar states
};

export const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setChatSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isChatSidebarOpen = action.payload;
    },
    setBlogSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isBlogSidebarOpen = action.payload;
    },
    // Add more reducers for other sidebar states
  },
});

export const { setChatSidebarOpen, setBlogSidebarOpen } = sidebarSlice.actions;
export default sidebarSlice.reducer;
export type { SidebarState };
