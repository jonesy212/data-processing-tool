import { StructuredMetadata } from '@/app/configs/StructuredMetadata';
import { ContentState } from 'draft-js';

interface CustomContentState  {
  contentState: ContentState;
  metadata: StructuredMetadata;
  customProperty: string; // Add any additional properties here
}

// Alternatively, you can define a wrapper class
class CustomContentStateWrapper {
  contentState: ContentState;
  metadata: StructuredMetadata;

  constructor(
    contentState: ContentState,
    metadata: StructuredMetadata) {
    this.contentState = contentState;
    this.metadata = metadata;
  }
}

export default CustomContentStateWrapper;
export type { CustomContentState };
