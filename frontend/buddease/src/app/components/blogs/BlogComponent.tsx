// BlogComponent.tsx
import React from 'react';

interface BlogProps {
  title: string;
  content: string;
  // You can add more properties as needed (date, author, etc.)
}

const BlogComponent: React.FC<BlogProps> = ({ title, content }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
      {/* Additional blog styling and features can be added */}
    </div>
  );
};

export default BlogComponent;
