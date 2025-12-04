// persistSnapshot.ts
// app/state/snapshots/persistSnapshot.ts
import { BaseDataEntity, DefaultExcludedFields, DefaultMeta } from "@/app/config/BaseConfig";
import { DatabaseConfig } from "@/app/config/DatabaseConfig";
import { DatabaseClient } from "@/app/api/DatabaseClient";
import { Attachment } from "@/app/documents/attachment/Attachment";
import { useNotification } from '@/app/state/context/NotificationContext';
import { SnapshotDataType } from '@/app/snapshots/SnapshotContainer';
import { handleApiError } from '@/app/api/ApiLogs';
import { notify } from "@/utils/snapshotUtils";
import { sanitizeInput } from '@/app/models/cypto/SanitizationFunctions'

const { notify } = useNotification(); 


export async function persistSnapshotDB<
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
  const dbClient = new DatabaseClient(config);
  const sanitizedData = sanitizeInput(snapshotData);

  try {  // <- ADD THIS OPENING BRACE
    await dbClient.connect();
    if (operationType === "upsert") {
      await dbClient.upsertData("snapshots", sanitizedData);
    } else {
      await dbClient.insertData("snapshots", sanitizedData);
    }

    notify("snapshotSaveSuccess", "Snapshot saved successfully", `Snapshot ID ${snapshotId} saved`, new Date(), "SUCCESS");
  } catch (error: unknown) {  // <- Use 'unknown' or 'any' instead of instanceof in catch clause
    if (error instanceof Error) {
      handleApiError(error, "persistSnapshotDB");
    } else {
      handleApiError(new Error(String(error)), "persistSnapshotDB");
    }
    notify("snapshotSaveError", "Error saving snapshot", `Failed to save Snapshot ID ${snapshotId}`, new Date(), "ERROR");
    throw error;
  } finally {
    await dbClient.close();
  }
} 