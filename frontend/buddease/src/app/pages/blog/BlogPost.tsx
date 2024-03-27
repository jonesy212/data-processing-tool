// BlogPost.tsx
import { Member } from '@/app/components/models/teams/TeamMembers';
import { ReactNode } from 'react';
// create BlogPostProps
interface BlogPostProps{
  title: string
  content: string
  author: Member['memberName']
  date: ReactNode

}

const BlogPost: React.FC<BlogPostProps> = ({ title, content, author, date }) => {
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

export default BlogPost;
