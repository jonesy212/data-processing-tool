// Tag.ts

import { Tag } from "../models/tracker/Tag";

export interface TaggableItem {
  id: string;
  title: string;
  description: string;
  localeCompare: (otherTag: Tag) => number;
  // Add any other properties specific to the taggable item
}
