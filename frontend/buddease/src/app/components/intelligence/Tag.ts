// Tag.ts

export interface TaggableItem {
    id: string;
    title: string;
  description: string;
  localeCompare: (otherTag: Tag) => number;
    // Add any other properties specific to the taggable item
  }
  
  export interface Tag {
    id: string;
    name: string;
    // Add any other properties specific to the tag
  }
  