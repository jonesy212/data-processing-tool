// useTagManagerSlice.ts
import { Tag, TagOptions } from '@/app/components/models/tracker/Tag';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { RootState } from './RootSlice';

interface TagManagerState {
  tags: Tag[];
}

const initialState: TagManagerState = {
  tags: [],
};

export const useTagManagerSlice = createSlice({
  name: 'tagManager',
  initialState,
  reducers: {
    addTag: (state, action: PayloadAction<Tag>) => {
      state.tags.push(action.payload);
    },
    removeTag: (state, action: PayloadAction<string>) => {
      state.tags = state.tags.filter(tag => tag.getId() !== action.payload);
    },
    updateTag: (state, action: PayloadAction<Tag>) => {
      const index = state.tags.findIndex(tag => tag.getId() === action.payload.getId());
      if (index !== -1) {
        state.tags[index] = action.payload;
      }
      },
      createTag: (state, action: PayloadAction<TagOptions>) => {
        const newTag = new Tag(action.payload);
        state.tags.push(newTag);
      },
  },
});

// Selector to get the tag manager state
export const selectTagManager = (state: RootState) => state.tagManager;

// Selector to get all tags
export const selectTags = (state: RootState) => selectTagManager(state).tags;

export const { addTag, removeTag, updateTag, createTag } = useTagManagerSlice.actions;
export default useTagManagerSlice.reducer;
