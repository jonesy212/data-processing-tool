BlogPage.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { BlogActions } from "@/core/components/models/blogs/BlogAction";
import createDynamicHook, { DynamicHookParams } from "@/core/hooks/dynamicHooks/dynamicHookGenerator";
import { AsyncHook } from "@/core/hooks/useAsyncHookLinker";
import BlogPostComponent, { BlogPost } from "@/core/pages/blog/BlogPost";
import { RootState } from "@/core/state/redux/slices/RootSlice";

Define a typed version of useSelector using the root state type
const useSelectorTyped = (selector: (state: RootState) => any) => useSelector(selector);

Define a function to create dynamic hooks with RootState
const createDynamicHookWithRootState = (hookParams: DynamicHookParams<RootState>): AsyncHook<RootState> => createDynamicHook(hookParams);

const BlogPage: React.FC = () => {
  const dispatch = useDispatch();
  const posts: BlogPost[] = useSelectorTyped((state) => state.blogManager.posts);

  useEffect(() => {
    dispatch(BlogActions.fetchPostsRequest());
  }, [dispatch]);

  return (
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
  );
};


Combine the component and the function into a single export statement
export { createDynamicHookWithRootState, BlogPage as default };

