// BlogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface CustomComment extends BlogComment {
  // Define properties specific to your custom comment type
  // content: string;
}

interface BlogState {
  posts: BlogPost[];
  comments: (BlogComment | CustomComment)[];
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
  pinned: boolean;
}

const initialState: BlogState = {
  posts: [],
  comments: [],
  // Initialize other state properties
};

export const useBlogManagerSlice = createSlice({
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

export const { addPost, addComment } = useBlogManagerSlice.actions;
export default useBlogManagerSlice.reducer;
export type { BlogComment, CustomComment };

