// BlogPostHistory.tsx

import { BlogPost } from "@/app/community/DiscussionForumComponent";
import Version from "./Version";
import { HistoryEntry } from '@/components/state/stores/HistoryStore'

interface BlogPostHistory extends BlogPost {
  version: Version<T, K>;// Reference to the version of the post
  history: HistoryEntry[] | undefined; // History of changes made to the post
}

interface BlogGeneratorProps {
  posts: BlogPostHistory[]; // Updated to accept VersionedBlogPost
}

export default BlogPostHistory;
export type { BlogGeneratorProps };
