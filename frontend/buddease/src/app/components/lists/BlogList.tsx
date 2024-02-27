// BlogList.tsx
import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import BlogPost from '../../pages/blog/BlogPost';

interface BlogListProps {
  blogPosts: typeof BlogPost[];
}

const BlogList: React.FC<BlogListProps> = ({ blogPosts }) => {
  return (
    <div>
      <h2>Blog Posts</h2>
      <ListGenerator items={blogPosts} />
      {/* You can pass additional props to customize the list if needed */}
    </div>
  );
};

export default BlogList;
