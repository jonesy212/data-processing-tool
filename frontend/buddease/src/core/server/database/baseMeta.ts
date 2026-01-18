// baseMeta.ts
import type { StructuredMetadata } from '@/core/config/StructuredMetadata';
import type { createMetadata } from '@/core/config/metadata/createMetadata';

export const baseMeta = createMetadata<any, string, StructuredMetadata<any, string>>({
  area: 'dashboard',
  currentMeta: {} as StructuredMetadata<any, string>,
  metadataEntries: {}
});

export default baseMeta;
