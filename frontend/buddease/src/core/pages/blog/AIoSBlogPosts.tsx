// AIoSBlogPosts.tsx

import axiosInstance from '@/core/api/csrfToken';
import BlogGenerator from '@/core/pages/blog/BlogGenerator';

import type { BlogPost } from '@/core/pages/blog/BlogPost';
import BlogPostList from '@/core/pages/blog/BlogPosts';
import React, { useEffect, useState } from 'react';
import type { Article } from 'core/pages/blog/Blog'

const AndroidBlogPosts: React.FC = () => {
  const [androidPosts, setAndroidPosts] = useState<BlogPost[]>([]);
  const [articles, setarticles] = useState<Article[]>([])

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
      <BlogPostList platform="android"
        posts={androidPosts}
        articles={articles}
      />
      <BlogGenerator
        posts={androidPosts}
        articles={articles}
        generateBlogPosts={() => []} />
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
