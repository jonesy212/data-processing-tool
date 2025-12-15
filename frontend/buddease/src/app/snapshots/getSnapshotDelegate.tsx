// getSnapshotDelegate.tsx
import * as snapshotApi from '@/app/api/SnapshotApi';
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from '@/app/config/BaseConfig';
import { Attachment } from '@/app/documents/attachment/Attachment';
import { Snapshot } from '@/app/snapshots/Snapshot';
import { SnapshotContainer } from '@/app/snapshots/SnapshotContainer';

interface DelegateType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
    processSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => void;
    anotherTask: () => void;
  }
  

// Define the delegate function that retrieves the delegate based on the snapshot ID and store ID
async function getSnapshotDelegate<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(
  snapshotId: string,
  storeId: number
): Promise<DelegateType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> | null> {
  try {
    // You may need to fetch the snapshot container first
    const snapshotContainer = await snapshotApi.getSnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>(snapshotId, storeId);

    if (!snapshotContainer) {
      console.error("Snapshot container not found for snapshotId:", snapshotId);
      return null;
    }

    // Extract or generate the delegate from the snapshot container
    const delegate = snapshotContainer.delegate || createDelegateFromContainer(snapshotContainer);

    // If delegate is not defined, throw an error or return a default delegate
    if (!delegate) {
      console.error("Delegate not found in snapshot container for snapshotId:", snapshotId);
      return null;
    }

    return delegate;
  } catch (error) {
    console.error("Error fetching snapshot delegate:", error);
    return null;
  }
}

// Helper function to create a delegate from a container if needed
function createDelegateFromContainer<  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T>(container: SnapshotContainer<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>): DelegateType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields> {
  return {
    processSnapshot: (snapshot: Snapshot<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>) => {
      try {
        const snapshotId = snapshot.id;

        if (container.mappedSnapshotData.has(String(snapshotId))) {
          const existingSnapshot = container.mappedSnapshotData.get(String(snapshotId));

          if (existingSnapshot) {
            // Ensure existingSnapshot.data is a Map
            if (existingSnapshot.data instanceof Map) {
              // Merge or update existing snapshot data with the new snapshot data
              existingSnapshot.data = new Map([...existingSnapshot.data, ...snapshot.data]);
              console.log(`Updated snapshot with id: ${snapshotId}`);
            } else {
              console.error(`Existing snapshot data for id ${snapshotId} is not a Map.`);
            }
          } else {
            console.error(`Snapshot with id: ${snapshotId} does not exist in the container.`);
          }
        } else {
          // Add new snapshot to the container
          container.mappedSnapshotData.set(String(snapshotId), snapshot);
          console.log(`Added new snapshot with id: ${snapshotId}`);
        }
      } catch (error) {
        console.error("Error processing snapshot:", error);
      }
    },

    anotherTask: () => {
      try {
        // Example logic for another task related to snapshots
        console.log("Performing another task related to snapshots.");
        // Implement specific logic here, such as cleaning up or analyzing data
        // For instance, let's assume we need to log all snapshot IDs:
        container.mappedSnapshotData.forEach((snapshot, id) => {
          console.log(`Snapshot ID: ${id}`);
        });
      } catch (error) {
        console.error("Error performing another task:", error);
      }
    }
  };
}


export { getSnapshotDelegate };
export type { DelegateType };

