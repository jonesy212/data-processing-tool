import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import { Data } from "../models/data/Data";
import { Phase } from "../phases/Phase";
import SnapshotStore, { Snapshot } from "../snapshots/SnapshotStore";

// Define a type representing the data structure for blog posts
interface BlogData {
  _id: string;
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  data: {
    snapshots: SnapshotStore<Snapshot<Data, Meta, Data>>[];
  };
}

// Define a type representing the details item specific to blog posts
interface BlogDetailsItem extends DetailsItem<BlogData> {}

interface BlogListProps {
  blogPosts: BlogData[];
}

const blogData: Data = {} as Data;

const BlogList: React.FC<BlogListProps> = ({ blogPosts }) => {
  const detailsItems: BlogDetailsItem[] = blogPosts.map((post) => ({
    _id: post._id,
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
export type {BlogData}