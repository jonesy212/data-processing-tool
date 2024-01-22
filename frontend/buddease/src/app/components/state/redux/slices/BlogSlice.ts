// BlogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BlogState {
  posts: BlogPost[];
  comments: BlogComment[];
  // Add more state properties as needed
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
}

interface BlogComment {
  id: string;
  postId: string;
  text: string;
}

const initialState: BlogState = {
  posts: [],
  comments: [],
  // Initialize other state properties
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    addPost: (state, action: PayloadAction<BlogPost>) => {
      state.posts.push(action.payload);
    },
    addComment: (state, action: PayloadAction<BlogComment>) => {
      state.comments.push(action.payload);
    },
    // Add more reducers for updating and managing the blog state
  },
});

export const { addPost, addComment } = blogSlice.actions;
export default blogSlice.reducer;
