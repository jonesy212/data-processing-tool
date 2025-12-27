// getSnapshotDifference.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import type {  Snapshot } from '@/app/snapshots/Snapshot';


function getSnapshotDifference<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(snapshot1: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>, snapshot2: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): number {
    if (snapshot1.data && snapshot2.data) {
      const length1 = Array.isArray(snapshot1.data) || typeof snapshot1.data === "string" 
        ? snapshot1.data.length 
        : 0;
        
      const length2 = Array.isArray(snapshot2.data) || typeof snapshot2.data === "string" 
        ? snapshot2.data.length 
        : 0;
  
      return Math.abs(length1 - length2);
    }
    return 0;
  }
  
  export { getSnapshotDifference };
