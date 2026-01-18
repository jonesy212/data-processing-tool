// BlogPost.tsx
import React from 'react';

export interface  BlogPost {
  id: number;
  title: string;
  content: string;
  author: string;
  updatedAt: Date | undefined
  createdAt: Date | undefined
  upvotes: number;
  date: Date | undefined;
  version: {
    versionNumber: string;
  };
  history: {
    entries: {
      timestamp: number;
      data: any;
    }[];
  };
  posts?: BlogPost[];
};

const BlogPostComponent: React.FC<BlogPost> = ({
  title,
  content,
  author,
  date,
  posts,
}) => {
  return (
    <div className="blog-post">
      <h2 className="blog-post-title">{title}</h2>
      <div className="blog-post-meta">
        <span className="author">Author: {author}</span>
        <span className="date">Date: {date?.toLocaleDateString()}</span>
      </div>
      <div className="blog-post-content">{content}</div>
    </div>
  );
};

export default BlogPostComponent;
