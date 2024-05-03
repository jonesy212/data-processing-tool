// AIoSBlogPosts.tsx
import React, { useEffect, useState } from 'react';
import BlogGenerator from './BlogGenerator'; // Assuming BlogGenerator is located in the same directory
import axiosInstance from '@/app/api/axiosInstance';
import {BlogPostProps} from './BlogPost';
import BlogPostList from './BlogPosts';



const AndroidBlogPosts: React.FC = () => {
  const [androidPosts, setAndroidPosts] = useState<BlogPostProps['posts']>([]); // Initialize androidPosts state with the correct type

  useEffect(() => {
    // Fetch Android blog posts from API or other data source
    const fetchAndroidPosts = async () => {
      try {
        const response = await axiosInstance.get('/api/android/posts');
        setAndroidPosts(response.data);
      } catch (error) {
        console.error('Error fetching Android blog posts:', error);
      }
    };

    fetchAndroidPosts();
  }, []);

  return <BlogPostList platform="android" posts={androidPosts} />; // Pass the correct type of posts to BlogPosts
};


const IoSBlogPosts: React.FC = () => {
  const [androidPosts, setAndroidPosts] = useState<BlogPostProps['posts']>([]);

  useEffect(() => {
    const fetchAndroidPosts = async () => {
      try {
        const response = await axiosInstance.get('/api/android/posts');
        setAndroidPosts(response.data);
      } catch (error) {
        console.error('Error fetching Android blog posts:', error);
      }
    };

    fetchAndroidPosts();
  }, []);

  return <AndroidBlogPosts />;
};

 
export { AndroidBlogPosts, IoSBlogPosts };
