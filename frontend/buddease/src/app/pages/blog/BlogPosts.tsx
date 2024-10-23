// BlogPosts.tsx
 import React from 'react';
import { BlogPost } from './BlogPost';
 

interface BlogPostsProps  {
  platform: 'android' | 'ios'; // Prop to specify the platform
  posts: BlogPost[]; // Array of blog posts
}

const BlogPostList: React.FC<BlogPostsProps> = ({ platform }) => {
  const androidPosts: BlogPost[] = [
    {
      id: 0,
      title: "Android-specific files and configurations",
      content: "Configuration files and directories for Android development.",
      author: "Android Dev",
      upvotes: 0,
      createdAt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
      updatedAt: new Date(),
      date: undefined,
      version: {
        versionNumber: ''
      },
      history: {
        entries: []
      }
    },
    // Add more Android-specific blog posts as needed
  ];

  const iOSPosts: BlogPost[] = [
    {
      id: 0,
      title: "iOS-specific files and configurations",
      content: "Configuration files and directories for iOS development.",
      author: "iOS Dev",
      upvotes: 0,
      createdAt: new Date("2024-03-02"), // Fixed by changing 'date' to 'createdAt'
      updatedAt: new Date(),
      date: undefined,
      version: {
        versionNumber: ''
      },
      history: {
        entries: []
      }
    },
    // Add more iOS-specific blog posts as needed
  ];

  const posts = platform === "android" ? androidPosts : iOSPosts; // Determine which set of posts to use

  return (
    <div>
      <h1>Blog Posts</h1>
      {posts.map((post, index) => (
        <div key={index}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
          <p>Author: {post.author}</p>
          <p>Date: {post.createdAt?.toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default BlogPostList;
