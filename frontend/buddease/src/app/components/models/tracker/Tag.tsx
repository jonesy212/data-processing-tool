// Tag.tsx
import React from 'react';

interface TagOptions {
  id: string;
  name: string;
  color: string;
}

interface TagProps {
  tagOptions: TagOptions;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}


const TagComponent: React.FC<TagProps> = ({ tagOptions }) => {
  const display = () => {
    console.log(`Tag Name: ${tagOptions.name}`);
    console.log(`Tag Color: ${tagOptions.color}`);
  };

  const getOptions = () => {
    return tagOptions;
  };

  const getId = () => {
    return tagOptions.id;
  };

  return (
    <div>
      <p>Tag Name: {tagOptions.name}</p>
      <p>Tag Color: {tagOptions.color}</p>
    </div>
  );
};

export default TagComponent;

// export default Tag;

// Example usage
const tagOptions1: TagOptions = {
  id: "1",
  name: "Important",
  color: "red",
};

const tagOptions2: TagOptions = {
  id: "2",
  name: "Less Important",
  color: "blue",
};

const tag1: React.ReactElement = <TagComponent tagOptions={tagOptions1} />;
const tag2: React.ReactElement = <TagComponent tagOptions={tagOptions2} />;

// Example usage of functions
tag1.props.children();
tag2.props.children();

// Sorting function
const localeCompare = (a: TagOptions, b: TagOptions) => {
  return a.name.localeCompare(b.name);
};

const sortTags = (tags: TagOptions[]) => {
  tags.sort(localeCompare);
  return tags;
};


export const createTag = (id: string, name: string, color: string): TagOptions => ({
  id,
  name,
  color,
});


export type { Tag, TagOptions };
