// metadataUtils.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { BaseData } from '@/app/models/data/Data';
import SnapshotStore from '@/app/snapshots/SnapshotStore';
import { ContentState } from "draft-js";


async function getMetadataForContent<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(contentId: string, content: string): Promise<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    // Process the content string<T extends  BaseData<any>,
    // ...
  }
  
  
  
async function getMetadataFromPlainText<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T ,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>>(contentId: string,
  contentState: ContentState,
): Promise<StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>> {
    const contentString = contentState.getPlainText();
    return await getMetadataForContent(contentId, contentString);
  }

  async function isUnifiedMetaDataOptions<
  T extends BaseData<any>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
>(this: SnapshotStore<T, K, Meta>): Promise<boolean> {
  // Check if metadata has specific properties
  return 'metadataEntries' in this.metadata || 'startDate' in this.metadata;
}

  // Type guard to check if metadata is a generic record
  async function isGenericMetadata(): SnapshotStore<T, K, Record<string, any>> {
    return !isUnifiedMetaDataOptions();
  }
  
  export { getMetadataForContent, getMetadataFromPlainText, isGenericMetadata, isUnifiedMetaDataOptions };
