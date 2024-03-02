// AIoSBlogPosts.tsx
import React from 'react';
import BlogGenerator from './BlogGenerator'; // Assuming BlogGenerator is located in the same directory

const AndroidBlogPosts: React.FC = () => {
  const androidPosts = [
    {
      title: 'Android-specific files and configurations',
      content: 'Configuration files and directories for Android development.',
      author: 'Android Dev',
      date: '2024-03-01',
    },
    // Add more Android-specific blog posts as needed
  ];

  return <BlogGenerator posts={androidPosts} />;
};

const IOSBlogPosts: React.FC = () => {
  const iOSPosts = [
    {
      title: 'iOS-specific files and configurations',
      content: 'Configuration files and directories for iOS development.',
      author: 'iOS Dev',
      date: '2024-03-02',
    },
    // Add more iOS-specific blog posts as needed
  ];

  return <BlogGenerator posts={iOSPosts} />;
};

export { AndroidBlogPosts, IOSBlogPosts };
