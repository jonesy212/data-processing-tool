// BlogPostHistory.tsx

import { BlogPost } from "@/core/pages/blog/BlogPost";
import { HistoryEntry } from '@/core/state/stores/HistoryStore';
import Version from "./Version";

interface BlogPostHistory extends BlogPost {
  version: Version<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;// Reference to the version of the post
  history: HistoryEntry[] | undefined; // History of changes made to the post
}

interface BlogGeneratorProps {
  posts: BlogPostHistory[]; // Updated to accept VersionedBlogPost
}

export default BlogPostHistory;
export type { BlogGeneratorProps };
