// AndroidBlogPostsContainer.tsx

import internalApiService from "@/core/api/ApiClient";

import React, { useEffect, useState } from 'react';
import { AndroidBlogPosts, IoSBlogPosts } from '@/core/pages/blog/AIoSBlogPosts'; // Importing the BlogPosts components

const AndroidBlogPostsContainer: React.FC = () => {
  const [androidPosts, setAndroidPosts] = useState([]);

  useEffect(() => {
    const fetchAndroidPosts = async () => {
      try {
        const response = await internalApiService.get("/api/android/posts");
        const generatedPosts = response.data;
        setAndroidPosts(generatedPosts);
      } catch (error) {
        console.error("Error fetching Android blog posts:", error);
      }
    };

    fetchAndroidPosts();
  }, []);

  return <AndroidBlogPosts platform="android" posts={androidPosts} />;
};

const IoSBlogPostsContainer: React.FC = () => {
  const [iosPosts, setIOSPosts] = useState([]);

  useEffect(() => {
    const fetchIOSPosts = async () => {
      try {
        const response = await internalApiService.get('/api/ios/posts');
        const generatedPosts = response.data;
        setIOSPosts(generatedPosts);
      } catch (error) {
        console.error('Error fetching iOS blog posts:', error);
      }
    };

    fetchIOSPosts();
  }, []);

  return <IoSBlogPosts platform="ios" posts={iosPosts} />;
};

export { AndroidBlogPostsContainer as AndroidBlogPosts, IoSBlogPostsContainer as IoSBlogPosts };
