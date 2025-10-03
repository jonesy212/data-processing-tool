
// BlogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlogPost } from '@/app/pages/blog/BlogPost';
import { VideoComment, BlogComment, CustomComment, EntityComments } from '@/app/components/models/data/Comments';

interface BlogState {
  posts: BlogPost[];
  comments: EntityComments<'blog'> | EntityComments<'custom'> | EntityComments<'video'>;
}

const initialState: BlogState = {
  posts: [],
  comments: [],
};

export const useBlogManagerSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.push(action.payload);
    },
    addComment: (state, action: PayloadAction<BlogComment | VideoComment | CustomComment>) => {
      state.comments.push(action.payload);
    },
    // Add more reducers as needed
  },
});

export const { addPost, addComment } = useBlogManagerSlice.actions;
export default useBlogManagerSlice.reducer;
export type { BlogComment, CustomComment, BlogState };