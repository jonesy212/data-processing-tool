// baseMeta.ts
import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { createMetadata } from './metadataFactory';

export const baseMeta = createMetadata<any, string, StructuredMetadata<any, string>>({
  area: 'dashboard',
});

export default baseMeta;
