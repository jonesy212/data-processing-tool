// BlogSlice.ts
import { Data } from '@/app/components/models/data/Data';
import { BlogPost } from '@/app/pages/blog/BlogPost';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';



interface CustomComment extends BlogComment {
  // Define properties specific to your custom comment type
  // content: string;
  data?: string | Data | undefined
}

interface BlogState {
  posts: BlogPost[];
  comments: (BlogComment |VideoComment | CustomComment)[];
  // Add more state properties as needed
}


interface BlogComment {
  id: string;
  postId: string;
  text: string;
  pinned: boolean;
  postedId: string;
  author: string;
  timestamp:  Date | string 
}


interface VideoComment {
  id: string;
  videoId: string;
  text: string;
  pinned: boolean;
  postedId: string;
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
export type { BlogComment, BlogState, CustomComment };

