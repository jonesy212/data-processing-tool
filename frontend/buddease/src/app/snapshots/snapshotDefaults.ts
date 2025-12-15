// snapshotDefaults.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { StatusType } from "@/app/models/data/StatusType";
import { Snapshot } from '@/app/snapshots/Snapshot';

function defaultTransformDelegate<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    // Example transformation logic
    // You can modify the snapshot data here, e.g., adding metadata or modifying existing fields.
    snapshot.metadata = {
      ...snapshot.metadata,
      transformed: true, // Add a transformed flag to metadata
    };
  
    return snapshot;
  }
  function defaultAddDataStatus<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    id: number,
    status: StatusType | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
  

  

  function defaultRemoveData<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    id: number,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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
    
  function defaultUpdateData<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    id: number,
    newData: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

  function defaultUpdateDataTitle<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
  id: number,
  title: string,
  snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

  
function defaultUpdateDataDescription<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    id: number,
    description: string,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

  

  function defaultUpdateDataStatus<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    id: number,
    status: StatusType | undefined,
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

  
  function defaultAddDataSuccess<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(
    payload: { data: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>[] },
    snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>
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

