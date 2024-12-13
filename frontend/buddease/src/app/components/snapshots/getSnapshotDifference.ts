import { BaseData } from '@/app/components/models/data/Data';
import { Snapshot } from '@/app/components/snapshots/LocalStorageSnapshotStore';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";


function getSnapshotDifference<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(snapshot1: Snapshot<T, K>, snapshot2: Snapshot<T, K>): number {
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
