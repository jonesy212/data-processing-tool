import React from "react";
import { BlogPost } from "@/app/components/community/DiscussionForumComponent";
import GroupGenerator from "@/app/generators/GroupGenerator";
import Group from "@/app/components/communications/chat/Group";
import ListGenerator from "@/app/generators/ListGenerator";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";

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
