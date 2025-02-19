// BlogGenerator.tsx
import { Post } from '@/app/components/community/DiscussionForumComponent';
import React from 'react';
import { BlogPost } from './BlogPost';


interface BlogGeneratorProps {
  posts: BlogPost[];
  generateBlogPosts: () => BlogPost[]; // Function signature for generateBlogPosts
  articles: []
}

const BlogGenerator: React.FC<BlogGeneratorProps> = ({ posts, generateBlogPosts, articles }) => {
  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map((post, index) => (
        <div key={index}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Author: {post.author}</p>
          <p>Date: {post.date?.toLocaleString()}</p>
          {/* Display version and history information */}
          <p>Version: {post.version.versionNumber}</p>
          {/* Display history entries */}
          <ul>
            {post.history.entries.map((entry, idx) => (
              <li key={idx}>
                <p>
                  {entry.timestamp}: {entry.data}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};


export default BlogGenerator