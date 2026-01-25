// BlogSlice.ts

import type { BlogComment, CustomComment, EntityComments, VideoComment } from '@/core/models/comments/Comments';
import type { BlogPost } from '@/core/pages/blog/BlogPost';
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

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
export type { BlogComment, BlogState, CustomComment };
