// AppMetadataEntity.ts
// MetadataEntity.ts
import { StructuredMetadata } from "@/app/config/StructuredMetadata";
import { AppBaseParams } from '@/app/typings/entities/AppEntity';
import { UnifiedMetadata } from "@/app/config/MetaDataOptions";

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
  

    export type { AppMetadataEntity, AppUnifiedMetadata, AppStructuredMetadata }