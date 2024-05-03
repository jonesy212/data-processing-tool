// BlogPage.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import RootLayout from "@/app/RootLayout";
import BlogPost, { BlogPostProps } from "./BlogPost";
import { BlogActions } from "@/app/components/models/blogs/BlogAction";
import createDynamicHook, { DynamicHookParams } from "@/app/components/hooks/dynamicHooks/dynamicHookGenerator";
import { RootState } from "@/app/components/state/redux/slices/RootSlice";

// Define a typed version of useSelector using the root state type
const useSelectorTyped = (selector: (state: RootState) => any) => useSelector(selector);

// Example usage of createDynamicHook with RootState
const createDynamicHookWithRootState = (hookParams: DynamicHookParams) => createDynamicHook(hookParams);

const BlogPage: React.FC = () => {
  const dispatch = useDispatch();
  const posts: BlogPostProps[] = useSelectorTyped((state) => state.blog.posts);

  useEffect(() => {
    dispatch(BlogActions.fetchPostsRequest());
  }, [dispatch]);

  return (
    <RootLayout>
      <div>
        <h1>Blog</h1>
        {posts.map((post) => (
          <BlogPost
            id={post.id}
            key={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            date={post.date}
          />
        ))}
      </div>
    </RootLayout>
  );
};

export default BlogPage;
