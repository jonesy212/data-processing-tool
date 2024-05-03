// BlogGenerator.tsx
import React from 'react';

interface BlogPost {
  title: string;
  content: string;
  author: string;
  date: string;
  version: {
    versionNumber: string;

  }
  history: {
    entries: {
      timestamp: number;
      data: any;
    }[]
  }
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
