import { Content } from '@/app/components/models/content/AddContent';
import { BaseData } from '@/app/components/models/data/Data';
import { StatusType } from "@/app/components/models/data/StatusType";
import { Snapshot } from "@/app/components/snapshots/LocalStorageSnapshotStore";
import { DetailsItem } from "@/app/components/state/stores/DetailsListStore";
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import ListGenerator from "@/app/generators/ListGenerator";
import React from "react";
import { Data, SharedBaseData } from "../models/data/Data";
import { Phase } from "../phases/Phase";
 
// Define a type representing the data structure for blog posts
interface BlogData<
  T extends  BaseData<any>,
  K extends T = T,
  Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K> 
  > extends SharedBaseData<K> {
  _id: string;
  id: string;
  title?: string;
  content: string | Content<T, K> | undefined;
  author: string;
  date: string | Date | undefined;
  subtitle: string;
  description?: string | undefined;
  data?: Content<T, K> | Snapshot<Data<T>, Meta>,
  startDate: Date
}

// Define a type representing the details item specific to blog posts
interface BlogDetailsItem extends DetailsItem<BlogData<Data<any>, Data<any>>> {}

interface BlogListProps {
  blogPosts: BlogData<Data<any>, Data<any>>[];
}

const blogData: Data<any> = {} as Data<any>;

const BlogList: React.FC<BlogListProps> = ({ blogPosts }) => {
  const detailsItems: BlogDetailsItem[] = blogPosts.map((post) => ({    
    _id: post._id,
    id: post.id,
    title: post.title,
    status: StatusType.Pending,
    description: post.description,
    phase: {} as Phase,
    data: blogData,
    subtitle: post.subtitle,
    value: post.author,
    content: post.content,
    date: post.date ? new Date(post.date) : undefined, // Convert to Date if it's a string
    startDate: post.startDate
  }));

  return (
    <div>
      <h2>Blog Posts</h2>
      <ListGenerator items={detailsItems} />
    </div>
  );
};

export default BlogList;
export type { BlogData };
