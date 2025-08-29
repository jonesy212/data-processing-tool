// Comments.ts
import { Content } from '@/app/components/models/content/AddContent';
import { BaseData, Data } from '@/app/components/models/data/Data';
import { ColorPalettes } from 'antd/es/theme/interface';
import { TagsRecord } from '../../snapshots/SnapshotWithCriteria';
import { Attachment } from '@/app/components/documents/Attachment/attachment'
import { UnifiedMetaDataOptions } from "@/app/configs/database/MetaDataOptions";
import { BaseDataEntity, DefaultMeta, DefaultExcludedFields } from '@/app/configs/BaseConfig';

// Define a basic type for the data associated with a comment
type CommentData =  BaseData<any> & {
    id: string;
    content: string;
    author: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  
  // Define a type for the metadata associated with a comment
type CommentMeta<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>

> = UnifiedMetaDataOptions<T, K, Meta, ExcludedFields> & {
    isPinned?: boolean;
    isFlagged?: boolean;
    likesCount?: number;
    repliesCount?: number;
  };
  
  // Define a type for additional comment type information
  type CommentType = 'Blog' | 'Chat' | 'Forum';
  
  
interface Comment<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>
> extends BaseData<T, K, Meta, AttachmentType, ExcludedFields> {
  id?: string;
  text?: string | Content<T, K, Meta>;
  editedAt?: Date;
  editedBy?: string;
  attachments?: AttachmentType[];
  replies?: Comment<T, K, Meta>[];
  likes?: number;
  watchLater?: boolean;
  highlightColor?: ColorPalettes;
  tags?: TagsRecord<T, K> | string[] | undefined;
  highlights?: string[];
  author?: string | number | readonly string[] | undefined;
  upvotes?: number;
  content?: string | Content<T, K>;
  resolved?: boolean;
  pinned?: boolean;
  postId?: string | number;
  data?: string | Data<T> | undefined;
  customProperty?: string;
  // Add other properties as needed
}
  

  export type {
    Comment, CommentData,
    CommentMeta,
    CommentType
};
