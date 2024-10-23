// BlogPage.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import RootLayout from "@/app/RootLayout";
import createDynamicHook, { DynamicHookParams } from "@/app/components/hooks/dynamicHooks/dynamicHookGenerator";
import { BlogActions } from "@/app/components/models/blogs/BlogAction";
import { RootState } from "@/app/components/state/redux/slices/RootSlice";
import BlogPostComponent, { BlogPost } from "./BlogPost";
import { AsyncHook } from "@/app/components/hooks/useAsyncHookLinker";

// Define a typed version of useSelector using the root state type
const useSelectorTyped = (selector: (state: RootState) => any) => useSelector(selector);

// Define a function to create dynamic hooks with RootState
const createDynamicHookWithRootState = (hookParams: DynamicHookParams<RootState>): AsyncHook<RootState> => createDynamicHook(hookParams);

const BlogPage: React.FC = () => {
  const dispatch = useDispatch();
  const posts: BlogPost[] = useSelectorTyped((state) => state.blogManager.posts);

  useEffect(() => {
    dispatch(BlogActions.fetchPostsRequest());
  }, [dispatch]);

  return (
    <RootLayout>
      <div>
        <h1>Blog</h1>
        {posts.map((post) => (
          <BlogPostComponent
            id={post.id}
            key={post.id}
            title={post.title}
            content={post.content}
            author={post.author}
            date={post.date} upvotes={0} version={{
              versionNumber: ""
            }} history={{
              entries: []
            }}
            updatedAt={undefined}
            createdAt={undefined}
          />
        ))}
      </div>
    </RootLayout>
  );
};


// Combine the component and the function into a single export statement
export { BlogPage as default, createDynamicHookWithRootState };
