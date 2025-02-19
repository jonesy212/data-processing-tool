// MyBlog.tsx
import React from 'react';
import BlogGenerator from './BlogGenerator';

const MyBlog: React.FC = () => {
  const posts = [
    {
      title: 'First Post',
      content: 'This is the content of the first post.',
      author: 'John Doe',
      date: '2024-02-25',
    },
    {
      title: 'Second Post',
      content: 'This is the content of the second post.',
      author: 'Jane Smith',
      date: '2024-02-26',
    },
  ];

  return <BlogGenerator posts={posts} />;
};

export default MyBlog;
