// ExtendedDappEntity.ts
import type { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/core/config/BaseConfig';
import type { ipfsConfig } from '@/core/config/ipfsConfig';
import type { Attachment } from '@/core/documents/attachment/Attachment';
import type { DAppAdapterConfig } from '@/utils/web3/dAppAdapter/DAppAdapterConfig';
import type { PoolConfig } from 'pg';
// Core ExtendedDapp base types using the 6-parameter pattern
type ExtendedDappEntity = BaseDataEntity & {
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string;
  dappProps?: any;
  dbConfig: PoolConfig;
  systemApiResponse: any; 
  userApiResponse: any;
  // ... other ExtendedDappProps properties
};

type ExtendedDappK = ExtendedDappEntity;
type ExtendedDappMeta = DefaultMeta<ExtendedDappEntity, ExtendedDappK>;
type ExtendedDappAttachment = Attachment;
type ExtendedDappExcludedFields = DefaultExcludedFields<ExtendedDappEntity>;
type ExtendedDappIncludedFields = keyof ExtendedDappEntity;

// Parameter container for consistent referencing (matches ConfigBaseParams pattern)
type ExtendedDappBaseParams = {
  T: ExtendedDappEntity;
  K: ExtendedDappK;
  Meta: ExtendedDappMeta;
  AttachmentType: ExtendedDappAttachment;
  ExcludedFields: ExtendedDappExcludedFields;
  IncludedFields: ExtendedDappIncludedFields;
};

// If you need to maintain backward compatibility with ExtendedDappProps name
type ExtendedDappProps = ExtendedDappEntity;


interface ExtendedDAppAdapterConfig extends DAppAdapterConfig<
  ExtendedDappEntity,  // T
  ExtendedDappK,       // K
  ExtendedDappMeta,    // Meta
  ExtendedDappAttachment,  // AttachmentType
  ExtendedDappExcludedFields,  // ExcludedFields
  ExtendedDappIncludedFields   // IncludedFields
> {
  ipfsConfig: typeof ipfsConfig;
  ethereumRpcUrl: string;
}
export type {
    ExtendedDappAttachment, ExtendedDappBaseParams, ExtendedDappEntity, ExtendedDappExcludedFields,
    ExtendedDappIncludedFields, ExtendedDappK,
    ExtendedDappMeta, ExtendedDappProps
};

