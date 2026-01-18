// BlogGroup.tsx
import Group from "@/core/components/communications/chat/Group";
import GroupGenerator from "@/core/generators/GroupGenerator";
import ListGenerator from "@/core/generators/ListGenerator";
import { BlogPost } from "@/core/pages/blog/BlogPost";
import type { DetailsItem } from "@/core/state/stores/DetailsListStore";
import React from "react";

interface BlogGroupProps {
  blogGroups: Group<BlogPost>[];
}

const BlogGroup: React.FC<BlogGroupProps> = ({ blogGroups }) => {
  const renderBlogGroup = (group: Group<BlogPost>): JSX.Element => {
    const transformedPosts: DetailsItem<BlogPost>[] = group.items.map(
      (post, index) => ({
        id: post.id.toString(),
        label: "Post",
        value: post.content,
      })
    );

    return (
      <div>
        <h1>{group.groupName}</h1>
        <ListGenerator items={transformedPosts} />
      </div>
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
