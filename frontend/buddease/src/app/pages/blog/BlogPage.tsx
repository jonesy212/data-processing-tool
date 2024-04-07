// BlogPage.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
 
// import { BlogPost } from './types'; // Assuming the existence of a type for blog posts
import RootLayout from "@/app/RootLayout";
import BlogPost from "./BlogPost";

const BlogPage: React.FC = () => {
  
  const dispatch = useDispatch();

  const posts: BlogPost[] = useSelector(selectPosts);

  useEffect(() => {
    dispatch(fetchPostsRequest());
  }, [dispatch]);

  return (
    <RootLayout>
      <div>
        <h1>Blog</h1>
        {posts.map((post) => (
          <BlogPost
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