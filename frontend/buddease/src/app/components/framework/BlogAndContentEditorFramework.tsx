import React from 'react';
import BlogAndContentEditorWrapper from '../models/content/BlogAndContentEditorWrapper';
import { DashboardPanel } from '../hooks/userInterface/DashboardPanel';

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
