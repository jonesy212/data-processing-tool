// BlogPost.tsx
import { Member } from '@/app/components/models/teams/TeamMembers';
import { ReactNode } from 'react';
// create BlogPostProps
interface BlogPostsProps {
  platform: 'android' | 'ios'; // Prop to specify the platform
  posts: BlogPost[]; // Array of blog posts
}

interface BlogPost {
  id: number;
  title: string;
  content: string;
  author: string; // Assuming Member has a property memberName of type string
  date: React.ReactNode;
  posts?: BlogPostsProps[]; // Update to use BlogPostsProps instead of BlogPostProps
}

const BlogPostComponent: React.FC<BlogPost> = ({ title, content, author, date, posts }) => {
  return (
    <div className="blog-post">
      <h2 className="blog-post-title">{title}</h2>
      <div className="blog-post-meta">
        <span className="author">Author: {author}</span>
        <span className="date">Date: {date}</span>
      </div>
      <div className="blog-post-content">
        {content}
      </div>
    </div>
  );
};

export default BlogPostComponent;
export type { BlogPostProps };
