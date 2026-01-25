// Comments.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { UnifiedMetaDataOptions } from "@/core/config/MetaDataOptions";
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { BaseEntityProperties, SharedTimestamps } from '@/core/documents/RelatedProps';
import type { Content } from '@/core/models/content/AddContent';
import type { BaseData, Data } from '@/core/models/data/Data';
import type { TagsRecord } from '@/core/models/tracker/Tag';

// Base comment shared by all comment types
interface BaseComment<T extends BaseDataEntity> extends BaseEntityProperties, SharedTimestamps {
  id: string;
  author: string | number | readonly string[];
  content: string;
  editedAt?: Date;
  editedBy?: string;
  likes?: number;
  pinned?: boolean;
  resolved?: boolean;
  tags?: TagsRecord<T> | string[];
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
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends 
BaseComment<T>,
BaseData<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  text?: string | Content<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>;
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

interface CustomComment<
  T extends BaseDataEntity = BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
> extends BlogComment {
  // Use AllProperties for flexible data structure
  data?: string | AllProperties<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | undefined;
  // Additional custom properties
  customType?: string;
  metadata?: Record<string, any>;
}

// Map entity → comment type for easy reference
interface EntityCommentMap {
  blog: BlogComment;
  video: VideoComment;
  chat: ChatComment;
  task: TaskComment;
  custom: CustomComment<any, any, any, any, any, any>; // Updated to use generic CustomComment
}

export type EntityComments<T extends keyof EntityCommentMap> = EntityCommentMap[T][];


export type {
    BlogComment,
    ChatComment, Comment,
    CommentData,
    CommentMeta,
    CommentType, CustomComment, EntityCommentMap, ForumComment, VideoComment
};

