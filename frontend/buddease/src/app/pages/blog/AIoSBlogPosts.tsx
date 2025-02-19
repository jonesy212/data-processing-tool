// AIoSBlogPosts.tsx

import axiosInstance from '@/app/api/axiosInstance';
import React, { useEffect, useState } from 'react';
import BlogGenerator from './BlogGenerator'; // Assuming BlogGenerator is located in the same directory
 import BlogPostList from './BlogPosts';
 import { BlogPost } from './BlogPost';

const AndroidBlogPosts: React.FC = () => {
  const [androidPosts, setAndroidPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchAndroidPosts = async () => {
      try {
        const response = await axiosInstance.get("/api/android/posts");
        const generatedPosts = response.data;
        setAndroidPosts(generatedPosts);
      } catch (error) {
        console.error("Error fetching Android blog posts:", error);
      }
    };

    fetchAndroidPosts();
  }, []);

  return (
    <div>
      <BlogPostList platform="android" posts={androidPosts} />
      <BlogGenerator posts={androidPosts} generateBlogPosts={() => []} />
    </div>
  );
};

const IoSBlogPosts: React.FC = () => {
  const [iosPosts, setIOSPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchIOSPosts = async () => {
      try {
        const response = await axiosInstance.get("/api/ios/posts");
        const generatedPosts = response.data ?? []; // Use default value if response data is undefined
        setIOSPosts(generatedPosts);
      } catch (error) {
        console.error("Error fetching iOS blog posts:", error);
      }
    };

    fetchIOSPosts();
  }, []);

  return <BlogPostList platform="ios" posts={iosPosts} />;
};

export { AndroidBlogPosts, IoSBlogPosts };
