BlogOverview.tsx

import React from 'react';
Import CSS for styling
if (typeof window !== 'undefined') {
  import('@/core/pages/blog/BlogOverview');
}

interface BlogOverviewProps {
  title: string;
  content: string;
  author: string;
  date: Date;
}

const BlogOverview: React.FC<BlogOverviewProps> = ({
  title,
  content,
  author,
  date,
}) => {
  return (
    <div className="blog-overview-container">
      <h2>{title}</h2>
      <div className="blog-details">
        <p>
          <strong>Author:</strong> {author}
        </p>
        <p>
          <strong>Date:</strong> {date.toDateString()}
        </p>
      </div>
      <div className="blog-content">{content}</div>
    </div>
  );
};

export default BlogOverview;
