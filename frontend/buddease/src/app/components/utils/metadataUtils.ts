import { SnapshotStore } from '@/app/components/snapshots/SnapshotStore';
import { UnifiedMetaDataOptions } from '@/app/configs/database/MetaDataOptions';
// metadataUtils.ts

import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { ContentState } from "draft-js";
import { Data } from 'ws';


async function getMetadataForContent<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(contentId: string, content: string): Promise<StructuredMetadata<T, Meta, K>> {
    // Process the content string
    // ...
  }
  
  
  
  async function getMetadataFromPlainText<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(contentId: string, contentState: ContentState): Promise<StructuredMetadata> {
    const contentString = contentState.getPlainText();
    return await getMetadataForContent(contentId, contentString);
  }



async function isUnifiedMetaDataOptions<T extends Data, Meta extends UnifiedMetaDataOptions, K extends Data = T>(): SnapshotStore<T, K, UnifiedMetaDataOptions> {
    
    return 'metadataEntries' in this.metadata || 'startDate' in this.metadata;
  }
  
  // Type guard to check if metadata is a generic record
  async function isGenericMetadata(): SnapshotStore<T, K, Record<string, any>> {
    return !isUnifiedMetaDataOptions();
  }
  
  export { getMetadataForContent, getMetadataFromPlainText, isGenericMetadata, isUnifiedMetaDataOptions };
