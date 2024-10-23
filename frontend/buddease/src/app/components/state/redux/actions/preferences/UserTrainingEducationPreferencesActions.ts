// UserTrainingEducationPreferencesActions.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserTrainingEducationPreferencesState {
  preferredTrainingTopics: string[];
  preferredLearningFormat: string;
}

const initialState: UserTrainingEducationPreferencesState = {
  preferredTrainingTopics: [],
  preferredLearningFormat: '',
};

const userTrainingEducationPreferencesSlice = createSlice({
  name: 'userTrainingEducationPreferences',
  initialState,
  reducers: {
    setPreferredTrainingTopics: (state, action: PayloadAction<string[]>) => {
      state.preferredTrainingTopics = action.payload;
    },
    setPreferredLearningFormat: (state, action: PayloadAction<string>) => {
      state.preferredLearningFormat = action.payload;
    },
  },
});

export const { setPreferredTrainingTopics, setPreferredLearningFormat } = userTrainingEducationPreferencesSlice.actions;

export default userTrainingEducationPreferencesSlice.reducer;
