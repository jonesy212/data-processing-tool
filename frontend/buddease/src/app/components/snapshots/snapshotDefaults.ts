import { BaseData } from '@/app/components/models/data/Data';
import { StructuredMetadata } from "@/app/configs/StructuredMetadata";
import { StatusType } from "../models/data/StatusType";
import { Snapshot } from "./LocalStorageSnapshotStore";

// snapshotDefaults.ts
function defaultTransformDelegate<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(snapshot: Snapshot<T, K>): Snapshot<T, K> {
    // Example transformation logic
    // You can modify the snapshot data here, e.g., adding metadata or modifying existing fields.
    snapshot.metadata = {
      ...snapshot.metadata,
      transformed: true, // Add a transformed flag to metadata
    };
  
    return snapshot;
  }
  function defaultAddDataStatus<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: number,
    status: StatusType | undefined,
    snapshot: Snapshot<T, K>
  ): void {
    if (!status) {
      console.error(`Status is undefined for ID ${id}.`);
      return;
    }
  
    if (snapshot.data && snapshot.data instanceof Map) {
      const item = snapshot.data.get(id.toString());
      if (item) {
        item.metadata = {
          ...item.metadata,
          status: status,
        };
        console.log(`Status updated for ID ${id}.`);
      } else {
        console.error(`Item with ID ${id} not found.`);
      }
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }
  

  

  function defaultRemoveData<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: number,
    snapshot: Snapshot<T, K>
  ): void {
    if (snapshot.data && snapshot.data instanceof Map) {
      if (snapshot.data.delete(id.toString())) {
        console.log(`Item with ID ${id} removed.`);
      } else {
        console.error(`Item with ID ${id} not found.`);
      }
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }
    
  function defaultUpdateData<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: number,
    newData: Snapshot<T, K>,
    snapshot: Snapshot<T, K>
  ): void {
    if (snapshot.data && snapshot.data instanceof Map) {
      if (snapshot.data.has(id.toString())) {
        snapshot.data.set(id.toString(), newData);
        console.log(`Item with ID ${id} updated.`);
      } else {
        console.error(`Item with ID ${id} not found.`);
      }
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }

  function defaultUpdateDataTitle<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
  id: number,
  title: string,
  snapshot: Snapshot<T, K>
): void {
  if (snapshot.data && snapshot.data instanceof Map) {
    const item = snapshot.data.get(id.toString());
    if (item) {
      item.description = title; // Assuming 'description' is used for the title
      console.log(`Title updated for ID ${id}.`);
    } else {
      console.error(`Item with ID ${id} not found.`);
    }
  } else {
    console.error(`Snapshot data is not a Map or is undefined.`);
  }
}

  
function defaultUpdateDataDescription<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: number,
    description: string,
    snapshot: Snapshot<T, K>
  ): void {
    if (snapshot.data && snapshot.data instanceof Map) {
      const item = snapshot.data.get(id.toString());
      if (item) {
        item.description = description;
        console.log(`Description updated for ID ${id}.`);
      } else {
        console.error(`Item with ID ${id} not found.`);
      }
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }

  

  function defaultUpdateDataStatus<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    id: number,
    status: StatusType | undefined,
    snapshot: Snapshot<T, K>
  ): void {
    if (!status) {
      console.error(`Status is undefined for ID ${id}.`);
      return;
    }
  
    if (snapshot.data && snapshot.data instanceof Map) {
      const item = snapshot.data.get(id.toString());
      if (item) {
        item.metadata = {
          ...item.metadata,
          status: status,
        };
        console.log(`Status updated for ID ${id}.`);
      } else {
        console.error(`Item with ID ${id} not found.`);
      }
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }

  
  function defaultAddDataSuccess<T extends  BaseData<any>, K extends T = T, Meta extends StructuredMetadata<T, K> = StructuredMetadata<T, K>>(
    payload: { data: Snapshot<T, K>[] },
    snapshot: Snapshot<T, K>
  ): void {
    if (snapshot.data && snapshot.data instanceof Map) {
      payload.data.forEach(item => {
        if (snapshot.data && item.id !== undefined) {
          snapshot.data.set(item.id.toString(), item);
        } else if (!snapshot.data) {
          console.error(`Snapshot data is null or undefined.`);
        } else {
          console.error(`Item ID is undefined, skipping item.`);
        }
      });
      console.log(`Data added successfully. Total items: ${snapshot.data.size}`);
    } else {
      console.error(`Snapshot data is not a Map or is undefined.`);
    }
  }
  
  export {
    defaultAddDataStatus, defaultAddDataSuccess, defaultRemoveData, defaultTransformDelegate, defaultUpdateData, defaultUpdateDataDescription,
    defaultUpdateDataStatus, defaultUpdateDataTitle
};

