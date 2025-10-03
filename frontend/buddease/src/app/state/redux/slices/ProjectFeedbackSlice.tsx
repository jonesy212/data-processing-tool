// ProjectFeedbackSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';
import { ProjectFeedback } from '@/app/components/support/ProjectFeedback';


interface ProjectFeedbackState {
  feedbackList: ProjectFeedback[];
}

const initialState: ProjectFeedbackState = {
  feedbackList: [],
};

export const projectFeedbackSlice = createSlice({
  name: 'projectFeedback',
  initialState,
  reducers: {
    // Action to add project feedback
    addProjectFeedback: (state, action: PayloadAction<ProjectFeedback>) => {
      state.feedbackList.push(action.payload);
    },
    // Action to remove project feedback
    removeProjectFeedback: (state, action: PayloadAction<string>) => {
      state.feedbackList = state.feedbackList.filter(
        (feedback) => feedback.projectId !== action.payload
      );
    },
    // Action to clear all project feedback
    clearAllProjectFeedback: (state) => {
      state.feedbackList = [];
    },
  },
});

// Export action creators
export const { addProjectFeedback, removeProjectFeedback, clearAllProjectFeedback } = projectFeedbackSlice.actions;

// Selectors to access project feedback state
export const selectProjectFeedback = (state: RootState) => state.projectManager.projectFeedback;

export default projectFeedbackSlice.reducer;

export type {
  ProjectFeedbackState,
  ProjectFeedback
};