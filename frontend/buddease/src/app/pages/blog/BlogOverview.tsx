// BlogOverview.ts
import React from 'react';
import './BlogOverview.css'; // Import CSS for styling

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
