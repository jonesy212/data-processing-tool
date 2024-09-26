import React from 'react';
import { TagsRecord } from '../../snapshots';
import { Data } from '../data/Data';

// Define the Tag interface and TagOptions interface
interface Tag extends Data {
  id: string;
  name: string;
  color: string;
  relatedTags: string[]
}

interface TagOptions {
  id: string;
  name: string;
  color: string;
  description: string;
  enabled: boolean;
  type: string;
  ags?: TagsRecord | string[] | undefined; 
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
  timestamp: number;
}

// TagProps for the TagComponent
interface TagProps {
  tagOptions: TagOptions;
}

// Functional Component TagComponent
const TagComponent: React.FC<TagProps> = ({ tagOptions }) => {
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
    </div>
  );
};

export default TagComponent;

// Example usage of TagComponent
const tagOptions1: TagOptions = {
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
      relatedTags: {},
      createdAt: undefined,
      updatedAt: undefined,
      createdBy: '',
      timestamp: 0
    }
  } ,
  createdAt: undefined,
  updatedAt: undefined,
  createdBy: '',
  timestamp: 0
};

const tagOptions2: TagOptions = {
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
  timestamp: 0
};

// Create React elements
const tag1: React.ReactElement = <TagComponent tagOptions={tagOptions1} />;
const tag2: React.ReactElement = <TagComponent tagOptions={tagOptions2} />;

// Example usage of functions
tag1.props.children;
tag2.props.children;

// Sorting function for TagOptions
const localeCompare = (a: TagOptions, b: TagOptions) => {
  return a.name.localeCompare(b.name);
};

const sortTags = (tags: TagOptions[]) => {
  tags.sort(localeCompare);
  return tags;
};

// Function to create a tag
export const createTag = (id: string, name: string, color: string, p0: {
  tags: (string[] | Tag[]

  ) & TagsRecord; description: string; enabled: boolean;
}): TagOptions => ({
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
  timestamp: 0
});

export type { Tag, TagOptions };
