import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import { Data } from "../models/data/Data";
import { Phase } from "../phases/Phase";

// Define a type representing the data structure for blog posts
interface BlogData {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  data: Data;
}

// Define a type representing the details item specific to blog posts
interface BlogDetailsItem extends DetailsItem<BlogData> {}

interface BlogListProps {
  blogPosts: BlogData[];
}

const blogData: Data = {} as Data;

const BlogList: React.FC<BlogListProps> = ({ blogPosts }) => {
  // Assign blogData to the data property of each blog post
  const detailsItems: DetailsItem<Data>[] = blogPosts.map((post) => ({
    id: post.id,
    title: post.title,
    status: "pending",
    description: post.content,
    phase: {} as Phase,
    data: blogData,
  }));

  return (
    <div>
      <h2>Blog Posts</h2>
      <ListGenerator items={detailsItems} />
    </div>
  );
};

export default BlogList;
