import React from 'react';
import { TagsRecord } from '../../snapshots';
import { BaseData } from '../data/Data';
import { ExcludedFields } from '../../routing/Fields';
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { AllTypes } from '../../typings/PropTypes';

// Define the Tag interface and TagOptions interface
interface Tag<
  T extends  BaseData<any>,
  K extends T = T
> extends TagOptions<T, K> {
  id: string;
  name: string;
  color: string;
  relatedTags: string[];
  // attribs:
}

interface TagOptions<
  T extends BaseData<any>,
  K extends T = T
> {
  id: string;
  name: string;
  color: string;
  description: string;
  enabled: boolean;
  type: string | AllTypes;
  nulltype: AllTypes;
  tags?: TagsRecord<T, K> | string[] | undefined; 
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  timestamp: number;
}

// TagProps for the TagComponent
// TagProps for passing tag options to a TagComponent
interface TagProps<T extends BaseData<any>, K extends T = T> {
  tagOptions: TagOptions<T, K>; // This will allow flexibility for the tag options
  excludedFields?: ExcludedFields<T, keyof T>;
  meta?: StructuredMetadata<T, K>; // You could include a MetaData type for extra metadata
}

// Functional Component TagComponent
const TagComponent: React.FC<TagProps<BaseData<any>>> = ({ tagOptions, excludedFields, meta  }) => {
  // Function to display tag options
  const display = () => {
    console.log(`Tag Name: ${tagOptions.name}`);
    console.log(`Tag Color: ${tagOptions.color}`);
  };

  // Function to return tag options
  const getOptions = () => {
    return tagOptions;
  };

  // Function to get tag id
  const getId = () => {
    return tagOptions.id;
  };

  // Render component
  return (
    <div>
      <p>Tag Name: {tagOptions.name}</p>
      <p>Tag Color: {tagOptions.color}</p>
      {/* Render metadata if available */}
      {meta && <span>Created By: {meta.createdBy}</span>}
    </div>
  );
};
export default TagComponent;

// Example usage of TagComponent
const tagOptions1: TagOptions<BaseData> = {
  id: "1",
  name: "Important",
  color: "red",
  description: '',
  enabled: false,
  type: '',
  tags: {
    "1": {
      id: "1",
      name: "Important",
      color: "red",
      description: '',
      enabled: false,
      type: '',
      relatedTags: [],
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: '',
      timestamp: 0
    },
    nulltype: {} as AllTypes
  },
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0
};

const tagOptions2: TagOptions<BaseData> = {
  id: "2",
  name: "Less Important",
  color: "blue",
  description: '',
  enabled: false,
  type: '',
  tags: undefined,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0,
  nulltype: {} as AllTypes
};

// Create React elements
const tag1: React.ReactElement = <TagComponent tagOptions={tagOptions1} />;
const tag2: React.ReactElement = <TagComponent tagOptions={tagOptions2} />;

// Example usage of functions
tag1.props.children;
tag2.props.children;

// Sorting function for TagOptions
const localeCompare =  <T extends BaseData, K extends T = T>(a: TagOptions<T, K>, b: TagOptions<T, K>) => {
  return a.name.localeCompare(b.name);
};

const sortTags =  <T extends BaseData, K extends T = T>(tags: TagOptions<T, K>[]) => {
  tags.sort(localeCompare);
  return tags;
};

// Function to create a tag
export const createTag =  <T extends BaseData, K extends T = T>(
  id: string, 
  name: string, 
  color: string,
  p0: {
  tags: (string[] | Tag<any, any>[]) & TagsRecord<any>;
  description: string; enabled: boolean;
}): TagOptions<T, K> => ({
  id,
  name,
  color,
  description: p0.description,
  enabled: p0.enabled,
  type: '',
  tags: p0.tags,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0,
  nulltype: {} as AllTypes
});

export type { Tag, TagOptions };
