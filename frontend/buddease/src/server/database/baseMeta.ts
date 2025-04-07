// baseMeta.ts
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { createMetadata } from '@/app/configs/metadata/createMetadata'

export const baseMeta = createMetadata<any, string, StructuredMetadata<any, string>>({
  area: 'dashboard',
  currentMeta: {} as StructuredMetadata<any, string>,
  metadataEntries: {}
});

export default baseMeta;
