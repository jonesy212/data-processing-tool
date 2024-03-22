import React from 'react';
import BlogAndContentEditorWrapper from './BlogAndContentEditorWrapper'; // Import the Blog and Content Editor Wrapper component

const BlogAndContentEditorFramework: React.FC = () => {
    return (
        <div>
            {/* Main dashboard framework layout */}
            <DashboardPanel />
            <BlogAndContentEditorWrapper /> {/* Include the Blog and Content Editor Wrapper component */}
        </div>
    );
};

export default BlogAndContentEditorFramework;
