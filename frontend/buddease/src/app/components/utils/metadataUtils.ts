// metadataUtils.ts
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
import { BaseData } from '@/app/components/models/data/Data';

import { Data } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { ContentState } from "draft-js";


async function getMetadataForContent<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(contentId: string, content: string): Promise<StructuredMetadata<T, K>> {
    // Process the content string<T extends  BaseData<T>,
    // ...
  }
  
  
  
async function getMetadataFromPlainText<T extends  BaseData<T>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(contentId: string,
  contentState: ContentState<T extends BaseData<T>>,
): Promise<StructuredMetadata<T, K>> {
    const contentString = contentState.getPlainText();
    return await getMetadataForContent(contentId, contentString);
  }

  async function isUnifiedMetaDataOptions<
  T extends BaseData<T>, 
  K extends T = T, 
  Meta extends StructuredMetadata<T, K>
>(this: SnapshotStore<T, K, Meta>): Promise<boolean> {
  // Check if metadata has specific properties
  return 'metadataEntries' in this.metadata || 'startDate' in this.metadata;
}

  // Type guard to check if metadata is a generic record
  async function isGenericMetadata(): SnapshotStore<T, K, Record<string, any>> {
    return !isUnifiedMetaDataOptions();
  }
  
  export { getMetadataForContent, getMetadataFromPlainText, isGenericMetadata, isUnifiedMetaDataOptions };
