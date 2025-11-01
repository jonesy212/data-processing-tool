// baseMeta.ts
import { StructuredMetadata } from '@/app/config/StructuredMetadata';
import { createMetadata } from '@/app/config/metadata/createMetadata'

export const baseMeta = createMetadata<any, string, StructuredMetadata<any, string>>({
  area: 'dashboard',
  currentMeta: {} as StructuredMetadata<any, string>,
  metadataEntries: {}
});

export default baseMeta;
