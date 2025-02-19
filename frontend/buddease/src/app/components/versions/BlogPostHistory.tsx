// BlogPostHistory.tsx

import { BlogPost } from "../community/DiscussionForumComponent";
import Version from "./Version";

interface HistoryEntry {
  id: string; // Unique identifier for the history entry
  timestamp: number; // Timestamp indicating when the entry was created
  data: any; // Data representing the state or action captured in the history entry
}

interface BlogPostHistory extends BlogPost {
  version: Version<T, K>;// Reference to the version of the post
  history: HistoryEntry[] | undefined; // History of changes made to the post
}

interface BlogGeneratorProps {
  posts: BlogPostHistory[]; // Updated to accept VersionedBlogPost
}

export default BlogPostHistory;
export type { BlogGeneratorProps };
