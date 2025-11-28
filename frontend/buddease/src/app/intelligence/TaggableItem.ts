// TaggableItem.ts
// Tag.ts

import { Tag } from "@/app/models/tracker/Tag";

export interface TaggableItem {
  id: string;
  title: string;
  description: string;
  localeCompare: (otherTag: Tag<T>) => number;
  // Add any other properties specific to the taggable item
}
