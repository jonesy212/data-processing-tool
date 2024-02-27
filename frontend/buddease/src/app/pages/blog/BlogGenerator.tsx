// BlogGenerator.tsx
import React from 'react';

interface BlogPost {
  title: string;
  content: string;
  author: string;
  date: string;
}

interface BlogGeneratorProps {
  posts: BlogPost[];
}

const BlogGenerator: React.FC<BlogGeneratorProps> = ({ posts }) => {
  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map((post, index) => (
        <div key={index}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Author: {post.author}</p>
          <p>Date: {post.date}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogGenerator;
