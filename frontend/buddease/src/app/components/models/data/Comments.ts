import { Content } from '@/app/components/models/content/AddContent';
import { Data } from '@/app/components/models/data/Data';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { ColorPalettes } from 'antd/es/theme/interface';
import { TagsRecord } from '../../snapshots/SnapshotWithCriteria';
import { Attachment } from './../../documents/Attachment/attachment';
// Comments.ts

// Define a basic type for the data associated with a comment
type CommentData = Data & {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  
  // Define a type for the metadata associated with a comment
  type CommentMeta = UnifiedMetaDataOptions & {
    isPinned?: boolean;
    isFlagged?: boolean;
    likesCount?: number;
    repliesCount?: number;
  };
  
  // Define a type for additional comment type information
  type CommentType = 'Blog' | 'Chat' | 'Forum';
  
  
 interface Comment<
  T extends Data = CommentData,
  Meta extends UnifiedMetaDataOptions = CommentMeta,
 K extends Data = T
    > {
    id?: string;
    text?: string | Content<T, K>;
    editedAt?: Date;
    editedBy?: string;
    attachments?: Attachment[];
    replies?: Comment<T, Meta, K>[];
    likes?: number;
    watchLater?: boolean;
    highlightColor?: ColorPalettes;
    tags?: TagsRecord | string[] | undefined; 
    highlights?: string[];
    // Consolidating commentBy and author into one field
    author?: string | number | readonly string[] | undefined;
    upvotes?: number;
    content?: string | Content<T, K>;
    resolved?: boolean;
    pinned?: boolean;
    // Consolidating upvotes into likes if they serve the same purpose
    postId?: string | number;
    data?: string | Data | undefined;
    customProperty?: string;
    // Add other properties as needed
  }
  

  export type {
    Comment, CommentData,
    CommentMeta,
    CommentType
};
