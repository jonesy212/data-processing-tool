// Comments.ts
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Content } from '@/app/models/content/AddContent';
import { BaseData, Data } from '@/app/models/data/Data';
import { TagsRecord } from '@/app/snapshots/SnapshotWithCriteria';
import { BaseDataEntity, BaseDataRoot, DefaultExcludedFields, DefaultMeta } from '@/config/BaseConfig';
import { UnifiedMetaDataOptions } from "@/config/MetaDataOptions";


// Base comment shared by all comment types
interface BaseComment {
  id: string;
  author: string | number | readonly string[];
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  editedAt?: Date;
  editedBy?: string;
  likes?: number;
  pinned?: boolean;
  resolved?: boolean;
  tags?: TagsRecord<any, any> | string[];
  highlights?: string[];
  watchLater?: boolean;
  customProperty?: string;
}

// Type for comment data
type CommentData = BaseData<any> & BaseComment;

// Metadata associated with a comment
type CommentMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> = UnifiedMetaDataOptions<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> & {
  isPinned?: boolean;
  isFlagged?: boolean;
  likesCount?: number;
  repliesCount?: number;
};

// Supported comment types
type CommentType = 'Blog' | 'Chat' | 'Forum';

// Main Comment interface extending BaseData
interface Comment<
  T extends BaseDataEntity = BaseDataRoot,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    BaseComment {
  text?: string | Content<T, K, Meta>;
  postId?: string | number;
  data?: string | Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  replies?: Comment<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[];
  // Add other entity-specific properties as needed
}


// Specific comment types extending BaseComment
interface BlogComment extends BaseComment {
  postId: string;
  postedId: string;
}

interface VideoComment extends BaseComment {
  videoId: string;
  postedId: string;
}

interface TaskComment extends BaseComment {
  taskId: string;
  userId: string;
}

interface ChatComment extends Comment<any> {
  chatRoomId: string; // specific to chat
}

interface ForumComment extends Comment<any> {
  threadId: string; // specific to forum
}

interface CustomComment extends BlogComment {
  // Define properties specific to your custom comment type
  // content: string;
  data?: string | Data<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined
}

// Map entity → comment type for easy reference
interface EntityCommentMap {
  blog: BlogComment;
  video: VideoComment;
  chat: ChatComment;
  task: TaskComment;
  custom: CustomComment;
}

export type EntityComments<T extends keyof EntityCommentMap> = EntityCommentMap[T][];


export type {
    BlogComment,
    ChatComment, Comment,
    CommentData,
    CommentMeta,
    CommentType, CustomComment, EntityCommentMap, ForumComment, VideoComment
};

