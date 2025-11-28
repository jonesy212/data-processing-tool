// AppDevelopmentProcess.tsx
import { AndroidBlogPosts, IoSBlogPosts } from '@/blog/AIoSBlogPosts';
import React from 'react';

const AppDevelopmentProcess: React.FC = () => {
  return (
    <div>
      <h1>App Development Process</h1>
      <h2>Android-specific Configurations</h2>
      <AndroidBlogPosts />
      <h2>iOS-specific Configurations</h2>
      <IoSBlogPosts />
      {/* Add other sub-phase components and forms */}
    </div>
  );
};

export default AppDevelopmentProcess;
