// AppMetadataEntity.ts
MetadataEntity.ts
import type { UnifiedMetadata } from "@/core/config/MetaDataOptions";
import type { StructuredMetadata } from "@/core/config/StructuredMetadata";
import { AppBaseParams } from '@/core/typings/entities/AppEntity';

type AppMetadataEntity = UnifiedMetadata<
  AppBaseParams["T"],
  AppBaseParams["K"],
  AppBaseParams["Meta"],
  AppBaseParams["AttachmentType"],
  AppBaseParams["ExcludedFields"],
  AppBaseParams["IncludedFields"]
  >;
    


  // Helper type to extract UnifiedMetadata with App types
  type AppUnifiedMetadata = UnifiedMetadata<
    AppBaseParams['T'],
    AppBaseParams['K'], 
    AppBaseParams['Meta'],
    AppBaseParams['AttachmentType'],
    AppBaseParams['ExcludedFields'],
    AppBaseParams['IncludedFields']
  >;
  
  // Helper type for StructuredMetadata
  type AppStructuredMetadata = StructuredMetadata<
    AppBaseParams['T'],
    AppBaseParams['K'],
    AppBaseParams['Meta'],
    AppBaseParams['AttachmentType'],
    AppBaseParams['ExcludedFields'],
    AppBaseParams['IncludedFields']
  >;
  

    export type { AppMetadataEntity, AppStructuredMetadata, AppUnifiedMetadata };
