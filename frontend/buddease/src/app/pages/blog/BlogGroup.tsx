// BlogGroup.tsx
import React from "react";
import { BlogPost } from "../types"; // Assuming you have a type for BlogPost
import GroupGenerator from "./GroupGenerator";

interface BlogGroupProps {
  blogGroups: { groupName: string; blogPosts: BlogPost[] }[];
}

const BlogGroup: React.FC<BlogGroupProps> = ({ blogGroups }) => {
  const renderBlogGroup = (group: { groupName: string; blogPosts: BlogPost[] }) => {
    return (
      <ul>
        {group.blogPosts.map((post, index) => (
          <li key={index}>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            {/* Render other blog post details as needed */}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1>Blog Groups</h1>
      <GroupGenerator groups={blogGroups} renderGroup={renderBlogGroup} />
    </div>
  );
};

export default BlogGroup;
