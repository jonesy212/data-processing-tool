// BlogAndContentEditorFramework.tsx
import { DashboardPanel } from '@/core/hooks/userInterface/DashboardPanel';
import BlogAndContentEditorWrapper from '@/core/models/content/BlogAndContentEditorWrapper';
import React from 'react';

const BlogAndContentEditorFramework: React.FC = () => {
  return (
    <div>
      {/* Main dashboard framework layout */}
      <DashboardPanel
        title="Dashboard Panel Title"
        content={<div>Dashboard Panel Content</div>}
      />
      <BlogAndContentEditorWrapper />{" "}
      {/* Include the Blog and Content Editor Wrapper component */}
    </div>
  );
};

export default BlogAndContentEditorFramework;
