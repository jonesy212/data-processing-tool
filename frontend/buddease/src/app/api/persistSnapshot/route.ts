import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/BaseConfig";
import { SnapshotDataType } from "@/app/snapshots";

import { DatabaseConfig } from "@/app/DatabaseConfig";


// Unified persistSnapshot function to handle both types (Snapshot, SnapshotData) and database operations
async function persistSnapshot<
  T extends BaseDataEntity,
  K extends T = T,
  Meta extends DefaultMeta<T, K> = DefaultMeta<T, K>,
  AttachmentType extends Attachment = Attachment,
  ExcludedFields extends keyof T = DefaultExcludedFields<T>,
  IncludedFields extends keyof T = keyof T
>(
  snapshotData: SnapshotDataType<T, K, Meta, AttachmentType, ExcludedFields, IncludedFields>,
  config: DatabaseConfig,
  snapshotId: string,
  operationType: "insert" | "upsert" = "upsert"
): Promise<void> {
  const dbClient = new DatabaseClient(config); // Initialize DatabaseClient with config

  // Step 1: Sanitize input
  const sanitizedData = sanitizeInput(snapshotData);

  try {
    // Step 2: Connect to the database
    await dbClient.connect();

    // Step 3: Choose operation based on operationType
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData); // Upsert data
    } else {
      await dbClient.insertData("snapshots", sanitizedData); // Insert data
    }

    // Step 4: Notify success
    notify("snapshotSaveSuccess", "Snapshot saved successfully", `Snapshot ID ${snapshotId} saved`, new Date(), "SUCCESS");
  } catch (error) {
    // Step 5: Handle errors and notify failure
    handleApiError(error, "persistSnapshot");
    notify("snapshotSaveError", "Error saving snapshot", `Failed to save Snapshot ID ${snapshotId}`, new Date(), "ERROR");
    throw error; // Re-throw to propagate error
  } finally {
    // Step 6: Close the database connection
    await dbClient.close();
  }
}
